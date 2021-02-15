const gsApp = {
    state: () => ({
        staticTabs: [
            {id: 0, static: true, name: 'Home', ico: 'H', child: 'home', mounted: () => {}},
            {id: 1, static: true, name: 'Settings', ico: 'S', child: 'settings', mounted: () => {}}
        ],
        dynamicTabs: [],
        tabsCreated: 2,
        dynmaicTabsLimit: 100,
        moneySpent: 0,
        notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
        sp: {
            csrfCookie: getCookie('csrf_cookie')
        },
        config: {
            remoteAccess: false,
            openBots: false,
            displayTabPreview: true,
            alwaysOnTop: true
        }
    }),
    getters: {
        csrfCookie(state) {
            return state.sp.csrfCookie;
        },
        notifySound(state) {
            return state.notifiSound;
        },
        config: (state) => (type) => {
            return state.config[type];
        },
        staticTabs(state) {
            return state.staticTabs;
        },
        dynamicTabs(state) {
            return state.dynamicTabs;
        }
    },
    mutations: {
        setCsrfCookie(state, cookie) {
            state.sp.csrfCookie = cookie;
        },
        setConfig(state, {type, value}) {
            state.config[type] = value;
        },
        addTab(state, callback = () => {}) {
            if(state.dynamicTabs.length >= state.dynmaicTabsLimit) return;

            const id = state.tabsCreated;
            const tab = {id: id, static: false, name: `Bot-${id}`, ico: `B`, child: 'bot', mounted: callback}
            
            state.dynamicTabs.push(tab);
            state.tabsCreated++;
        },
        closeTab(state, index) {
            state.dynamicTabs.splice(index, 1);
        },
        saveConfig(state) {
            chrome.storage.sync.set({config: state.config});
        },
        loadConfig(state, config) {
            if(config) state.config = config;
        }
    },
    actions: {
        openBots(context) {
            if(context.getters.config('openBots')) {
                for(let i = 1; i < context.getters.presets.length; i++) {
                    context.commit('addTab', tab => {
                        const bot = tab.$children[0].$children[0];
                        bot.updatePreset(i);
                        bot.run();
                    });
                }
            }
        }
    }
}