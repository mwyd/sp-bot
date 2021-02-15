const gsSession = {
    state: () => ({ 
        user: null,
        apiKey: null,
        logged: false
    }),
    getters: { 
        logged(state) {
            return state.logged;
        },
        apiKey(state) {
            return state.apiKey;
        }
    },
    mutations: {
        setSession(state, data) {
            state.user = data.user;
            state.apiKey = data.apiKey;
            state.logged = data.logged;
        }
    },
    actions: {
        authorize(context, data) {
            chrome.runtime.sendMessage({action: 'authorize', params: {apiKey: data.apiKey}}, res => {
                const {success, user} = res.data;

                if(success) {
                    context.commit('setSession', {user: user, apiKey: data.apiKey, logged: true});
                    context.dispatch('initWs');
                }
                else context.commit('setSession', {user: data.user, apiKey: data.apiKey, logged: false});

                chrome.storage.sync.set({user: user, apiKey: data.apiKey});
            });
        }
    }
}