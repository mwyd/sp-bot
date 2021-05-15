import Cookies from 'js-cookie'

export default {
    namespaced: true,
    state: () => ({
        tabs: [
            {
                id: 0,
                isStatic: true,
                name: 'Home',
                symbol: 'H',
                childComponent: 'Home'
            },
            {
                id: 1,
                isStatic: true,
                name: 'SaleGuard',
                symbol: 'G',
                childComponent: 'SaleGuard'
            },
            {
                id: 2,
                isStatic: true,
                name: 'PresetManager',
                symbol: 'P',
                childComponent: 'PresetManager'
            },
            {
                id: 3,
                isStatic: true,
                name: 'FriendManager',
                symbol: 'F',
                childComponent: 'FriendManager'
            },
            {
                id: 4,
                isStatic: true,
                name: 'Settings',
                symbol: 'S',
                childComponent: 'Settings'
            }
        ],
        tabReservedIds: Array.from(new Array(5).keys()),
        tabFreeIds: Array.from(new Array(45).keys()).map(e => e += 5),
        notificationSound: new Audio(chrome.runtime.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
        config: {
            displayItemStatistics: false,
            displayTabPreview: true,
            displayInterfaceOnTop: false,
            openTabsAtStartup: false
        },
        shadowpay: {
            csrfCookie: Cookies.get('csrf_cookie'),
            api: Object.freeze({
                MARKET_ITEMS: `https://api.shadowpay.com/api/market/get_items` +
                    `?types=[]` +
                    `&exteriors=[]` +
                    `&rarities=[]` +
                    `&collections=[]` +
                    `&item_subcategories=[]` +
                    `&float=%7B%22from%22:0,%22to%22:1%7D` +
                    `&price_from=0` +
                    `&price_to=20000` +
                    `&game=csgo` +
                    `&stickers=[]` +
                    `&count_stickers=[]` +
                    `&short_name=` +
                    `&search=` +
                    `&stack=false` +
                    `&sort=desc` + 
                    `&sort_column=price_rate` +
                    `&limit=50` +
                    `&offset=0`,
                BUY_ITEM: 'https://api.shadowpay.com/api/market/buy_item',
                BUY_HISTORY: 'https://api.shadowpay.com/en/profile/get_bought_history',
                ITEMS_ON_SALE: 'https://api.shadowpay.com/api/market/list_items',
                SAVE_ITEM_PRICE: 'https://api.shadowpay.com/api/market/save_item_price'
            })
        },
        steam: {
            resources: Object.freeze({
                ITEM_SELL_LISTINGS: 'https://steamcommunity.com/market/listings/730/',
                ITEM_IMAGE: 'https://community.cloudflare.steamstatic.com/economy/image/',
                USER_PROFILE: 'https://steamcommunity.com/profiles/'
            })
        },
        tabStates: Object.freeze({
            OK: 'ok',
            RUNNING: 'running',
            IDLE: 'idle',
            PENDING: 'pending',
            ERROR: 'error'
        })
    }),
    getters: {
        config: (state) => (type) => {
            return type == '*' ? state.config : state.config[type]
        }  
    },
    mutations: {
        setConfig(state, {type, value}) {
            type == '*' ? Object.assign(state.config, value) : state.config[type] = value
        },
        setCsrfCookie(state, cookie) {
            state.shadowpay.csrfCookie = cookie
        },
        addTab(state, tabProps) {
            if(state.tabFreeIds.length == 0) return

            tabProps.id = state.tabFreeIds.shift()
            state.tabReservedIds.push(tabProps.id)

            state.tabs.push(tabProps)

        },
        closeTab(state, id) {
            state.tabFreeIds.push(id)
            state.tabReservedIds.splice(state.tabReservedIds.indexOf(id), 1)

            state.tabs.splice(state.tabs.findIndex(tab => tab.id == id), 1)
        }
    },
    actions: {
        loadConfig({rootState, commit}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'get_config',
                params: {
                    token: rootState.session.token
                }
            }, 
            response => {
                const {success, data} = response

                if(success && data?.length > 0) {
                    commit('setConfig', {
                        type: '*', 
                        value: data[0].config
                    })
                }

                resolve(response)
            }))
        },
        saveConfig({rootState, getters}) {
            chrome.runtime.sendMessage({
                action: 'set_config', 
                params: {
                    config: getters.config('*'),
                    token: rootState.session.token
                }
            })
        },
        async setupApp({dispatch}) {
            await dispatch('session/loadToken', null, { root: true })
            await dispatch('session/authenticate', null, { root: true })
            await dispatch('loadConfig')
            await dispatch('presetManager/loadPresets', null, { root: true })
            //await dispatch('loadSaleGuardItems')
            //await dispatch('loadItemsOnSale')
        }
    }
}