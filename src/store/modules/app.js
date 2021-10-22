import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

export default {
    namespaced: true,
    state: () => ({
        loaded: null,
        backgroundMounted: false, 
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
        alertLifeTime: 2.0,
        alerts: new Map(),
        config: {
            steamVolumeLimit: 10,
            displayItemStatistics: false,
            displayTabPreview: true,
            displayInterfaceOnTop: false,
            openTabsAtStartup: false,
            saleGuardBidStep: 0.01,
            saleGuardSafeDiscount: 0.97,
            saleGuardUpdateDelay: 4.0
        },
        services: {
            shadowpay: {
                name: 'shadowpay',
                csrfCookie: Cookies.get('csrf_cookie'),
                api: Object.freeze({
                    MARKET_ITEMS: 'https://api.shadowpay.com/api/market/get_items',
                    STACKED_ITEMS: 'https://api.shadowpay.com/api/market/get_items_for_stacked',
                    BUY_ITEM: 'https://api.shadowpay.com/api/market/buy_item',
                    BUY_HISTORY: 'https://api.shadowpay.com/en/profile/get_bought_history',
                    ITEMS_ON_SALE: 'https://api.shadowpay.com/api/market/list_items',
                    SAVE_ITEM_PRICE: 'https://api.shadowpay.com/api/market/save_item_price',
                    IS_LOGGED: 'https://api.shadowpay.com/api/market/is_logged'
                })
            },
            steam: {
                name: 'steam',
                resources: Object.freeze({
                    ITEM_SELL_LISTINGS: 'https://steamcommunity.com/market/listings/730/',
                    ITEM_IMAGE: 'https://community.cloudflare.steamstatic.com/economy/image/',
                    USER_PROFILE: 'https://steamcommunity.com/profiles/'
                })
            },
            conduit: {
                name: 'conduit',
                api: Object.freeze({
                    USER: '/user',
                    PRESETS: '/shadowpay-bot-presets',
                    CONFIGS: '/shadowpay-bot-configs',
                    FRIENDS: '/shadowpay-friends',
                    STEAM_MARKET: '/steam-market-csgo-items',
                    SHADOWPAY_MARKET: '/shadowpay-sold-items',
                    SALE_GUARD: '/shadowpay-sale-guard-items',
                    RARE_PAINT_SEED_ITEMS: '/csgo-rare-paint-seed-items'
                })
            },
            csgoFloat: {
                name: 'csgo_float',
                api: {
                    INSPECT_ITEM: 'https://api.csgofloat.com/'
                }
            },
            csgoGallery: {
                name: 'csgo_gallery',
                resources: Object.freeze({
                    SCREENSHOT: 'https://csgo.gallery'
                })
            },
            self: {
                name: 'self',
                actions: {
                    INCREMENT_BUY_COUNTER: 'increment_buy_counter',
                    GET_BUY_COUNTER: 'get_buy_counter'
                }
            }
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
        setBackgroundMounted(state, value) {
            state.backgroundMounted = value
        },
        setConfig(state, {type, value}) {
            type == '*' ? Object.assign(state.config, value) : state.config[type] = value
        },
        setCsrfCookie(state, cookie) {
            state.services.shadowpay.csrfCookie = cookie
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
            state.alerts.set(alert.uuid, alert)
        },
        deleteAlert(state, uuid) {
            state.alerts.delete(uuid)
        }
    },
    actions: {
        async copyToClipboard({rootState, dispatch}, data) {
            const alert = {
                type: rootState.app.alertTypes.SUCCESS,
                message: 'Copied'
            }

            try {
                await navigator.clipboard.writeText(data)
            }
            catch(err) {
                alert.type = rootState.app.alertTypes.ERROR
                alert.message = 'Copy error'
            }

            dispatch('app/pushAlert', alert, { root: true })
        },
        loadConfig({rootState, commit}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: rootState.app.services.conduit.api.CONFIGS,
                    config: {
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`
                        }
                    }
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
                service: rootState.app.services.conduit.name,
                data: {
                    path: rootState.app.services.conduit.api.CONFIGS,
                    config: {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: `config=${JSON.stringify(getters.config('*'))}`
                    }
                }
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

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        pushAlert({state, commit}, alert) {
            const uuid = uuidv4()

            commit('addAlert', {
                uuid: uuid, 
                ...alert
            })

            if(!alert.persistent) setTimeout(() => commit('deleteAlert', uuid), state.alertLifeTime * 1000)

            return uuid
        },
        checkBackgroundMounted({rootState, commit, dispatch}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.self.name,
                data: {
                    action: rootState.app.services.self.actions.GET_BUY_COUNTER
                }
            },
            response => {
                const {data} = response

                if(data !== undefined) commit('setBackgroundMounted', true)
                else {
                    dispatch('app/pushAlert', {
                        type: rootState.app.alertTypes.ERROR,
                        persistent: true,
                        message: 'Background not mounted correctly - restart browser'
                    }, { root: true })
                }

                resolve(response)
            }))
        },
        async setupApp({rootState, commit, dispatch}) {
            const response = await fetch(rootState.app.services.shadowpay.api.IS_LOGGED, { credentials: 'include' })
            const { is_logged } = await response.json()

            if(!is_logged) {
                dispatch('app/pushAlert', {
                    type: rootState.app.alertTypes.ERROR,
                    persistent: true,
                    message: 'Shadowpay login required'
                }, { root: true })
            }
            else {
                await dispatch('checkBackgroundMounted')

                await dispatch('session/loadToken', null, { root: true })
                await dispatch('session/authenticate', null, { root: true })

                await dispatch('loadConfig')

                await dispatch('presetManager/loadPresets', null, { root: true })

                dispatch('bots/openBots', null, { root: true })
                    
                await dispatch('friendManager/loadFriends', null, { root: true })
                
                await dispatch('saleGuard/loadItemsOnSale', null, { root: true })
                await dispatch('saleGuard/loadSaleGuardItems', null, { root: true })
            }

            commit('setLoaded', true)
        }
    }
}