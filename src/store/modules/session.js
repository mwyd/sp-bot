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
        authenticate({commit, state}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'authenticate', 
                params: {
                    token: state.token
                }
            }, 
            response => {
                const session = {
                    user: null,
                    authenticated: false
                }

                const {success, data} = response

                if(success) {
                    session.user = data.name
                    session.authenticated = true
                }

                commit('setSession', session)
                resolve(response)
            }))
        }
    }
}