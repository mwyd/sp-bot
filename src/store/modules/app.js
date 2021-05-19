import Cookies from 'js-cookie'

export default {
    namespaced: true,
    state: () => ({
        loaded: null,
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
        tabReservedIds: [...new Array(5).keys()],
        tabFreeIds: [...new Array(45).keys()].map(e => e += 5),
        notificationSound: new Audio(chrome.runtime.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
        alertTypes: Object.freeze({
            SUCCESS: 'success',
            INFO: 'info',
            ERROR: 'error'
        }),
        alertLifeTime: 2 * 1000,
        alerts: [],
        config: {
            displayItemStatistics: false,
            displayTabPreview: true,
            displayInterfaceOnTop: false,
            openTabsAtStartup: false,
            saleGuardBidStep: 0.01,
            saleGuardSaleDiscount: 0.97,
            saleGuardItemUpdateDelay: 4 * 1000
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
        setLoaded(state, value) {
            state.loaded = value
        },
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
        },
        addAlert(state, alert) {
            state.alerts.push(alert)
        },
        shiftAlert(state) {
            state.alerts.shift()
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
        saveConfig({rootState, getters, dispatch}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'set_config', 
                params: {
                    token: rootState.session.token,
                    config: getters.config('*')
                },
            },
            response => {
                const {success, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Config saved'
                }

                if(!success) {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        updateAlerts({state, commit}, alert) {
            commit('addAlert', alert)
            setTimeout(() => commit('shiftAlert'), state.alertLifeTime)
        },
        async setupApp({commit, dispatch}) {
            await dispatch('session/loadToken', null, { root: true })
            await dispatch('session/authenticate', null, { root: true })

            await dispatch('loadConfig')

            await dispatch('presetManager/loadPresets', null, { root: true })
                  dispatch('bots/openBots', null, { root: true })
                  
            await dispatch('friendManager/loadFriends', null, { root: true })
            
            await dispatch('saleGuard/loadSaleGuardItems', null, { root: true })
            await dispatch('saleGuard/loadItemsOnSale', null, { root: true })

            commit('setLoaded', true)
        }
    }
}