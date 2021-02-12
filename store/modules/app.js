const gsApp = {
    state: () => ({
        moneySpent: 0,
        notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
        remoteAccess: false,
        sp: {
            csrfCookie: getCookie('csrf_cookie')
        }
    }),
    getters: {
        csrfCookie(state) {
            return state.sp.csrfCookie;
        },
        notifySound(state) {
            return state.notifiSound;
        },
        remoteAccess(state) {
            return state.remoteAccess;
        }
    },
    mutations: {
        setCsrfCookie(state, cookie) {
            state.sp.csrfCookie = cookie;
        },
        setRemoteAccess(state, value) {
            chrome.storage.sync.set({remoteAccess: value});
            state.remoteAccess = value;
        }
    }
    //actions: {},
}