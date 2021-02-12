const gsApp = {
    state: () => ({
        moneySpent: 0,
        notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
        sp: {
            csrfCookie: getCookie('csrf_cookie')
        }
    }),
    mutations: {
        setCsrfCookie(state, cookie) {
            state.sp.csrfCookie = cookie;
        }
    },
    //actions: {},
    getters: {
        csrfCookie(state) {
            return state.sp.csrfCookie;
        },
        notifySound(state) {
            return state.notifiSound;
        }
    }
}