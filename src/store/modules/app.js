import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import { userConfig } from '@/api/conduit'
import { market } from '@/api/shadowpay'
import { background } from '@/api/internal'
import { alertLifeTime } from '@/config'
import alertType from '@/enums/alertType'

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
        csrfCookie: Cookies.get('csrf_cookie')
    }),
    getters: {
        config: state => type => {
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
        setConfig(state, { type, value }) {
            type == '*' ? Object.assign(state.config, value) : state.config[type] = value
        },
        setCsrfCookie(state, cookie) {
            state.csrfCookie = cookie
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
        async loadConfig({ rootState, commit }) {
            const { success, data } = await userConfig.all(rootState.session.token, { offset: 0, limit: 50 })

            if(success && data?.length > 0) {
                commit('setConfig', {
                    type: '*', 
                    value: data[0].config
                })
            }
        },
        async saveConfig({ rootState, getters, dispatch }) {
            const { success, error_message } = await userConfig.upsert(rootState.session.token, getters.config('*'))

            const alert = {
                type: alertType.SUCCESS,
                message: 'Config saved'
            }

            if(!success) {
                alert.type = alertType.ERROR,
                alert.message = error_message
            }

            dispatch('pushAlert', alert)
        },
        pushAlert({ commit }, alert) {
            const uuid = uuidv4()

            commit('addAlert', {
                uuid: uuid, 
                ...alert
            })

            if(!alert.persistent) setTimeout(() => commit('deleteAlert', uuid), alertLifeTime * 1000)

            return uuid
        },
        async checkBackgroundMounted({ commit }) {
            const { data } = await background.getBuyCounter()

            if(data !== undefined) {
                commit('setBackgroundMounted', true)

                return
            }

            throw 'Background not mounted correctly - restart browser'
        },
        async checkUserLogged({ commit }) {
            const { is_logged } = await market.getStatus()

            if(is_logged) {
                commit('setLoaded', null) // temporary, no effect

                return
            }

            throw 'Shadowpay login required'
        },
        async setupApp({ dispatch, commit }) {
            try {
                await dispatch('checkUserLogged')

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
            catch(err) {
                dispatch('pushAlert', {
                    type: alertType.ERROR,
                    persistent: true,
                    message: err
                })
            }

            commit('setLoaded', true)
        }
    }
}