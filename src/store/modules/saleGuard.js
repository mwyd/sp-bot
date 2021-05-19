export default {
    namespaced: true,
    state: () => ({
        loaded: null,
        isRunning: false,
        items: new Map()
    }),
    getters: {
        isTracked: state => id => {
            const item = [...state.items.values()].find(data => data.item.id == id)
            return item?.metadata?.tracked
        },
        trackedItems(state) {
            return [...state.items.values()].filter(data => data.metadata.tracked)
        }
    },
    mutations: {
        setLoaded(state, value) {
            state.loaded = value
        },
        setSaleGuardItem(state, {id, data}) {
            state.items.set(id, {
                item: data.item,
                metadata: data.metadata
            })
        },
        setItemMinPrice(state, {id, minPrice}) {
            state.items.get(id).item._min_price = minPrice
        },
        setItemMaxPrice(state, {id, maxPrice}) {
            state.items.get(id).item._max_price = maxPrice
        },
        setItemMarketPrice(state, {id, price}) {
            const data = state.items.get(id)
            data.item.price_market_usd = price  
            data.item.discount = 100 - Math.round(data.item.price_market_usd * 100 / data.item.steam_price_en)
        },
        setMetadata(state, {id, metadata}) {
            state.items.get(id).metadata = metadata
        },
        setIsRunning(state, value) {
            state.isRunning = value
        },
        removeItem(state, id) {
            state.items.delete(id)
        }
    },
    actions: {
        toggleSaleGuard({state, commit, dispatch}) {
            if(state.isRunning) commit('setIsRunning', false)
            else {
                commit('setIsRunning', true)
                dispatch('run')
            }
        },
        async run({state, rootState, getters, rootGetters, commit, dispatch}) {
            const trackedItems = getters.trackedItems
            const timeoutDelay = rootGetters['app/config']('saleGuardItemUpdateDelay')
            const bidStep = rootGetters['app/config']('saleGuardBidStep')
            const saveItemPriceUrl = rootState.app.shadowpay.api.SAVE_ITEM_PRICE
            const getItemsUrl = new URL(rootState.app.shadowpay.api.MARKET_ITEMS)

            getItemsUrl.searchParams.set('sort_column', 'price')
            getItemsUrl.searchParams.set('sort', 'asc')

            if(trackedItems.length == 0) {
                dispatch('app/updateAlerts', {
                    type: rootState.app.alertTypes.INFO,
                    message: 'Sale Guard terminated - empty set'
                }, { root: true })
                dispatch('toggleSaleGuard')
                return
            }

            for(let data of trackedItems) {
                await new Promise(r => setTimeout(r, timeoutDelay))

                getItemsUrl.searchParams.set('price_from', data.item._min_price)
                getItemsUrl.searchParams.set('price_to', data.item._max_price)
                getItemsUrl.searchParams.set('search', data.item.steam_market_hash_name)

                const response = await fetch(getItemsUrl.toString(), {credentials: 'include'})
                const {status, items} = await response.json()

                if(status != 'success') continue

                let newPrice = data.item._max_price

                for(let marketItem of items) {
                    if( marketItem.is_my_item || 
                        marketItem.is_stattrak != data.item.is_stattrak || 
                        rootGetters['friendManager/itemOwner'](marketItem.user_id)
                    ) continue

                    if(marketItem.price_market_usd > data.item._min_price) {
                        newPrice = marketItem.price_market_usd - bidStep
                        break
                    }
                }

                if(data.item.price_market_usd == newPrice) continue

                fetch(saveItemPriceUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `id=${data.item.id}` +
                        `&price=${newPrice}` +
                        `&csrf_token=${rootState.app.shadowpay.csrfCookie}`
                })
                .then(res => res.json())
                .then(res => {
                    const {status, error_message, token} = res

                    if(status == 'success') {
                        commit('setItemMarketPrice', {
                            id: data.item.id,
                            price: newPrice
                        })
                    }
                    else {
                        switch(error_message) {
                            case 'wrong_token':
                                commit('app/setCsrfCookie', token, { root: true })
                                break

                            case 'bid_item_not_exist':
                                dispatch('stopTrack', data.metadata.databaseId)
                                break
                        }
                    }
                })
                .catch(err => console.log(err))
            }

            if(state.isRunning) dispatch('run')
        },
        startTrack({rootState, commit, dispatch}, item) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'set_saleguard_item',
                params: {
                    token: rootState.session.token,
                    item: item
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Item tracked'
                }

                if(success) {
                    commit('setMetadata', {
                        id: data.item.id,
                        metadata: {
                            tracked: true,
                            databaseId: data.id
                        }
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        updateTracked({rootState, dispatch}, {id, item}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'update_saleguard_item',
                params: {
                    token: rootState.session.token,
                    id: id,
                    item: item
                }
            }, 
            response => {
                const {success, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Tracked item updated'
                }

                if(!success) {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        stopTrack({rootState, commit, dispatch}, id) {
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
                    message: 'Item untracked'
                }

                if(success) {
                    commit('removeItem', data.item.id)
                    dispatch('loadItemsOnSale')
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/updateAlerts', alert, { root: true })
                resolve(response)
            }))
        },
        async loadSaleGuardItems({rootState, commit}) {
            const limit = 50
            let loopLimit = 1

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    action: 'get_saleguard_items', 
                    params: {
                        token: rootState.session.token,
                        offset: i * limit,
                        limit: limit
                    }
                }, 
                response => {
                    const {success, data} = response

                    let loaded = false

                    if(success) {
                        for(let item of data) {
                            commit('setSaleGuardItem', {
                                id: item.item.id,
                                data: {
                                    item: item.item, 
                                    metadata: {
                                        tracked: true,
                                        databaseId: item.id
                                    }
                                }                          
                            })
                        }

                        if(data.length == limit) loopLimit++

                        loaded = true
                    }

                    commit('setLoaded', loaded)
                    resolve(response)
                }))
            }
        },
        async loadItemsOnSale({rootState, rootGetters, getters, commit}) {
            try {
                const response = await fetch(rootState.app.shadowpay.api.ITEMS_ON_SALE, {credentials: 'include'})
                const {status, items} = await response.json()

                if(status != 'success') return

                for(let item of items) {
                    if(getters.isTracked(item.id)) continue

                    item.discount = Math.round(item.discount)
                    if(item.phase) item.steam_market_hash_name = rootGetters['item/steamHashName'](item.steam_market_hash_name)
                    
                    item._min_price = item.price_market_usd

                    item._max_price = Math.round(item.steam_price_en * rootGetters['app/config']('saleGuardSaleDiscount') * 100) / 100
                    if(item._max_price < item._min_price) item._max_price = Math.round((item._min_price + rootGetters['app/config']('saleGuardBidStep')) * 100) / 100

                    item._search_steam_hash_name = item.steam_market_hash_name.toLowerCase()

                    commit('setSaleGuardItem', {
                        id: item.id,
                        data: {
                            item: item,
                            metadata: {
                                tracked: false,
                                databaseId: null
                            }
                        }
                    })
                } 
            }
            catch(err) {
                console.log(err)
            }
        }
    }
}