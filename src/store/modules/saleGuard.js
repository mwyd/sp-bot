import { SPB_LOG, roundNumber } from '../../utils/index.js'

export default {
    namespaced: true,
    state: () => ({
        loaded: null,
        items: new Map()
    }),
    getters: {
        trackedItems(state) {
            return [...state.items.values()].filter(data => data.metadata.tracked)
        },
        untrackedItems(state) {
            return [...state.items.values()].filter(data => !data.metadata.tracked)
        }
    },
    mutations: {
        setLoaded(state, value) {
            state.loaded = value
        },
        setItems(state, items) {
            state.items = items
        },
        setItemMetadata(state, {id, metadata}) {
            const data = state.items.get(id)
            if(data) data.metadata = metadata
        },
        setItemMinPrice(state, {id, minPrice}) {
            const data = state.items.get(id)
            if(data) data.metadata.minPrice = minPrice
        },
        setItemMaxPrice(state, {id, maxPrice}) {
            const data = state.items.get(id)
            if(data) data.metadata.maxPrice = maxPrice
        },
        setItemMarketPrice(state, {id, price}) {
            const data = state.items.get(id)
            if(data) {
                data.item.price_market_usd = price
                data.item.discount = 100 - Math.round(data.item.price_market_usd * 100 / data.item.steam_price_en)
            }
        }
    },
    actions: {
        startTrack({rootState, commit, dispatch}, {shadowpayOfferId, hashName, minPrice, maxPrice}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'set_saleguard_item',
                params: {
                    token: rootState.session.token,
                    hashName: hashName,
                    shadowpayOfferId: shadowpayOfferId,
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Item added'
                }

                if(success) {
                    commit('setItemMetadata', {
                        id: data.shadowpay_offer_id,
                        metadata: {
                            databaseId: data.id,
                            tracked: true,
                            minPrice: data.min_price,
                            maxPrice: data.max_price,
                            createdAt: data.created_at
                        }
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        async startTrackAll({getters, dispatch}) {
            for(let {item, metadata} of getters.untrackedItems) {
                await dispatch('startTrack', {
                    shadowpayOfferId: item.id,
                    hashName: item.steam_market_hash_name,
                    minPrice: metadata.minPrice,
                    maxPrice: metadata.maxPrice
                })
            }
        },
        updateTracked({rootState, dispatch}, {id, data}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'update_saleguard_item',
                params: {
                    token: rootState.session.token,
                    id: id,
                    shadowpayOfferId: data.shadowpayOfferId,
                    minPrice: data.minPrice,
                    maxPrice: data.maxPrice
                }
            }, 
            response => {
                const {success, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Item updated'
                }

                if(!success) {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        stopTrack({rootState, commit, dispatch}, {id, showAlert = true}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'delete_saleguard_item',
                params: {
                    token: rootState.session.token,
                    id: id
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Item deleted'
                }

                if(success) {
                    commit('setItemMetadata', {
                        id: data.shadowpay_offer_id,
                        metadata: {
                            databaseId: null,
                            tracked: false,
                            minPrice: data.min_price,
                            maxPrice: data.max_price,
                            createdAt: null
                        }
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                if(showAlert) dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        async stopTrackAll({getters, dispatch}) {
            for(let {metadata} of getters.trackedItems) {
                await dispatch('stopTrack', {
                    id: metadata.databaseId,
                    showAlert: true
                })
            }
        },
        async loadItemsOnSale({state, rootState, rootGetters, commit, dispatch}) {
            try {
                const response = await fetch(rootState.app.shadowpay.api.ITEMS_ON_SALE, {
                    credentials: 'include'
                })

                const {status, items} = await response.json()

                if(status != 'success') return

                const updatedItems = new Map()

                for(let item of items) {
                    const itemOnSale = state.items.get(item.id)

                    if(!itemOnSale) {
                        item.discount = Math.round(item.discount)
                        item.price_market_usd = parseFloat(item.price_market_usd)
                        item._search_steam_hash_name = item.steam_market_hash_name.toLowerCase()
                        item._conduit_hash_name = item.steam_market_hash_name

                        if(item.phase) {
                            item.steam_market_hash_name = rootGetters['item/steamHashName'](item.steam_market_hash_name)
                            item._conduit_hash_name = item.steam_market_hash_name.replace('(', `${item.phase} (`)
                        }

                        let minPrice = item.price_market_usd
                        let maxPrice = roundNumber(item.steam_price_en * rootGetters['app/config']('saleGuardSafeDiscount'))
                        
                        if(maxPrice < minPrice) maxPrice = roundNumber(minPrice + rootGetters['app/config']('saleGuardBidStep'))
                    
                        updatedItems.set(item.id, {
                            item: item,
                            metadata: {
                                databaseId: null,
                                tracked: false,
                                minPrice: minPrice,
                                maxPrice: maxPrice
                            }
                        })

                        dispatch('item/getItemInfo', item, { root: true })
                    }
                    else updatedItems.set(item.id, itemOnSale)
                } 

                commit('setItems', updatedItems)
            }
            catch(err) {
                SPB_LOG('Cant load items on sale', err)
            }
        },
        async loadSaleGuardItems({state, rootState, commit, dispatch}) {
            const limit = 50
            let loopLimit = 1

            let loaded = true
            let missingItems = []

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    action: 'get_saleguard_items', 
                    params: {
                        token: rootState.session.token,
                        offset: i * limit,
                        limit: limit
                    }
                }, 
                async response => {
                    const {success, data} = response

                    if(success) {
                        for(let item of data) {
                            if(state.items.has(item.shadowpay_offer_id)) {
                                commit('setItemMetadata', {
                                    id: item.shadowpay_offer_id,
                                    metadata: {
                                        databaseId: item.id,
                                        tracked: true,
                                        minPrice: item.min_price,
                                        maxPrice: item.max_price,
                                        createdAt: item.created_at
                                    }
                                })
                            }
                            else missingItems.push(item.id)
                        }

                        if(data.length == limit) loopLimit++
                    }
                    else loaded = false

                    resolve(response)
                }))
            }

            for(let id of missingItems) {
                await dispatch('stopTrack', {
                    id: id,
                    showAlert: false
                })
            }

            commit('setLoaded', loaded)
        }
    }
}