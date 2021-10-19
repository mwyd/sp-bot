export default {
    namespaced: true,
    state: () => ({
        user: null,
        token: null,
        authenticated: null
    }),
    getters: {},
    mutations: {
        setToken(state, token) {
            state.token = token
        },
        setSession(state, data) {
            Object.assign(state, data)
        }
    },
    actions: {
        loadToken({commit}) {
            return new Promise(resolve => chrome.storage.sync.get(['token'], ({token}) => {
                commit('setToken', token)
                resolve(token)
            }))
        },
        saveToken({state}) {
            chrome.storage.sync.set({
                token: state.token
            })
        },
        authenticate({rootState, commit, state, dispatch}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: rootState.app.services.conduit.api.USER,
                    config: {
                        headers: {
                            'Authorization': `Bearer ${state.token}`
                        }
                    }
                }
            }, 
            response => {
                const session = {
                    user: null,
                    authenticated: false
                }

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Authenticated'
                }

                const {success, data, error_message} = response

                if(success) {
                    session.user = data.name
                    session.authenticated = true
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                commit('setSession', session)

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        }
    }
}