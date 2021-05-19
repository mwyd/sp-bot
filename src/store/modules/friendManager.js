export default {
    namespaced: true,
    state: () => ({
        loaded: null,
        friends: new Map([
            [0, 
                {
                    shadowpay_id: null, 
                    name: 'default'
                }
            ]
        ])
    }),
    getters: {
        friend: state => id => {
            return state.friends.get(id)
        },
        friendIds(state) {
            return [...state.friends.keys()]
        },
        itemOwner: state => shadowpayId => {
            let name = null

            state.friends.forEach((friend, id) => {
                if(id == 0) return

                if(friend.shadowpay_id == shadowpayId) {
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

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    action: 'get_friends', 
                    params: {
                        token: rootState.session.token,
                        offset: i * limit,
                        limit: limit
                    }
                }, 
                response => {
                    const {success, data} = response

                    let loaded = false

                    if(success) {
                        for(let friend of data) {
                            commit('setFriend', {
                                id: friend.id,
                                friend: {
                                    shadowpay_id: friend.shadowpay_id,
                                    name: friend.name
                                }
                            })
                        }

                        if(data.length == limit) loopLimit++

                        loaded = true
                    }

                    commit('setLoaded', loaded)
                    resolve(response)
                }))
            }
        },
        addFriend({rootState, commit, dispatch}, friend) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'set_friend',
                params: {
                    token: rootState.session.token,
                    shadowpay_id: friend.shadowpay_id,
                    name: friend.name
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
                            shadowpay_id: data.shadowpay_id,
                            name: data.name
                        }
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        updateFriend({rootState, commit, dispatch}, {id, friend}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'update_friend',
                params: {
                    token: rootState.session.token,
                    id: id,
                    shadowpay_id: friend.shadowpay_id,
                    name: friend.name
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
                            shadowpay_id: data.shadowpay_id,
                            name: data.name
                        }
                    }) 
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        deleteFriend({rootState, commit, dispatch}, id) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'delete_friend',
                params: {
                    token: rootState.session.token,
                    id: id
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

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        }
    }
}