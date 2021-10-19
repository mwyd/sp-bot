export default {
    namespaced: true,
    state: () => ({
        loaded: null,
        friends: new Map([
            [0, 
                {
                    shadowpayUserId: null, 
                    name: 'default'
                }
            ]
        ])
    }),
    getters: {
        friend: state => id => {
            return state.friends.get(id)
        },
        sortedFriends: state => sortAsc => {
            return [...state.friends].sort((a, b) => (a[1].shadowpayUserId - b[1].shadowpayUserId) * (sortAsc ? 1 : -1))
        },
        friendIds(state) {
            return [...state.friends.keys()]
        },
        itemOwner: state => shadowpayUserId => {
            let name = null

            state.friends.forEach((friend, id) => {
                if(id == 0) return

                if(friend.shadowpayUserId == shadowpayUserId) {
                    name = friend.name
                    return
                }
            })

            return name
        }
    },
    mutations: {
        setLoaded(state, value) {
            state.loaded = value
        },
        setFriend(state, {id, friend}) {
            state.friends.set(id, friend)
        },
        removeFriend(state, id) {
            state.friends.delete(id)
        }
    },
    actions: {
        async loadFriends({rootState, commit}) {
            const limit = 50
            let loopLimit = 1

            let loaded = true

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    service: rootState.app.services.conduit.name,
                    data: {
                        path: `${rootState.app.services.conduit.api.FRIENDS}?offset=${i * limit}&limit=${limit}`,
                        config: {
                            headers: {
                                'Authorization': `Bearer ${rootState.session.token}`
                            }
                        }
                    }
                }, 
                response => {
                    const {success, data} = response

                    if(success) {
                        for(let friend of data) {
                            commit('setFriend', {
                                id: friend.id,
                                friend: {
                                    shadowpayUserId: friend.shadowpay_user_id,
                                    name: friend.name
                                }
                            })
                        }

                        if(data.length == limit) loopLimit++
                    }
                    else loaded = false

                    resolve(response)
                }))
            }

            commit('setLoaded', loaded)
        },
        addFriend({rootState, commit, dispatch}, friend) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: rootState.app.services.conduit.api.FRIENDS,
                    config: {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: `shadowpay_user_id=${friend.shadowpayUserId}&name=${friend.name}`
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Friend added'
                }

                if(success) {
                    commit('setFriend', {
                        id: data.id,
                        friend: {
                            shadowpayUserId: data.shadowpay_user_id,
                            name: data.name
                        }
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        updateFriend({rootState, commit, dispatch}, {id, friend}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.FRIENDS}/${id}`,
                    config: {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: `shadowpay_user_id=${friend.shadowpayUserId}&name=${friend.name}`
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Friend updated'
                }

                if(success) {
                    commit('setFriend', {
                        id: data.id,
                        friend: {
                            shadowpayUserId: data.shadowpay_user_id,
                            name: data.name
                        }
                    }) 
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        deleteFriend({rootState, commit, dispatch}, id) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.FRIENDS}/${id}`,
                    config: {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`
                        }
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Friend deleted'
                }

                if(success) commit('removeFriend', data.id)
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        }
    }
}