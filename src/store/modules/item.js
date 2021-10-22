import { roundNumber } from '../../utils/index.js'

export default {
    namespaced: true,
    state: () => ({
        inspectLinkSteamIdRange: [
            11, 
            17
        ],
        inspectLinkSteamIdKeyword: 'preview',
        phases: [
            'Phase 1',
            'Phase 2',
            'Phase 3',
            'Phase 4',
            'Emerald',
            'Ruby',
            'Sapphire',
            'Black Pearl'
        ], 
        paintSeedVariantKeywords: [
            'Case Hardened',
            'Fade'
        ],
        highRankFloat: Math.pow(10, -3),
        interestingFloatRanges: [
            {
                min: 0, 
                max: 0.01
            },
            {
                min: 0.07, 
                max: 0.09
            },
            {
                min: 0.15, 
                max: 0.18
            },
            {
                min: 0.18, 
                max: 0.21
            },
            {
                min: 0.45, 
                max: 0.5
            },
            {
                min: 0.76, 
                max: 0.8
            }
        ],
        interestingProperites: Object.freeze({
            paintindex: {
                name: 'Paint index',
                unit: ''
            },
            paintseed: {
                name: 'Paint seed',
                unit: ''
            },
            phase: {
                name: 'Doppler',
                unit: ''
            },
            steam_is_souvenir: {
                name: '',
                unit: ''
            },
            steam_price_en: {
                name: 'Suggested price',
                unit: '$'
            },
            _steam_price: {
                name: 'Steam price',
                unit: '$'
            },
            _steam_volume: {
                name: 'Steam volume',
                unit: ''
            },
            _app_income: {
                name: 'Income',
                unit: '$'
            },
            _app_income_percentage: {
                name: 'Income',
                unit: '%'
            }
        }),
        shadowpayStatistics: Object.freeze({
            _app_sell_price: {
                name: 'Average sell price',
                unit: '$'
            },
            _avg_discount: {
                name: 'Average discount',
                unit: '%'
            },
            _sold: {
                name: 'Sold',
                unit: ''
            },
            _last_sold: {
                name: 'Last sold',
                unit: ''
            }
        }),
        mutableProperties: {
            _app_sell_price: null,
            _avg_discount: null,
            _sold: null,
            _last_sold: null
        },
        sortByTypes: Object.assign({
            REAL_DISCOUNT: 0,
            SHADOWPAY_DISCOUNT: 1,
            ITEM_FLOAT: 2,
            MARKET_PRICE: 3
        }),
        sortBy: new Map([
            [0, 
                {
                    name: 'Steam discount',
                    callback: function(asc) { 
                        return (a, b) => ((b._real_discount ?? 0) - (a._real_discount ?? 0)) * (asc ? -1 : 1)
                    }
                }
            ],
            [1, 
                {
                    name: 'Shadowpay discount',
                    callback: function(asc) { 
                        return (a, b) => (b.discount - a.discount) * (asc ? -1 : 1)
                    }
                }
            ],
            [2,
                {
                    name: 'Item float',
                    callback: function(asc) { 
                        return (a, b) => ((b.floatvalue || 1) - (a.floatvalue || 1)) * (asc ? -1 : 1)
                    }  
                }
            ],
            [3, 
                {
                    name: 'Market price',
                    callback: function(asc) { 
                        return (a, b) => (b.price_market_usd - a.price_market_usd) * (asc ? -1 : 1)
                    }  
                }
            ]
        ])
    }),
    getters: {
        hasInterestingFloat: state => float => {
            for(let range of state.interestingFloatRanges) {
                if(float >= range.min && float <= range.max) return true
            }
            return false
        },
        hasPaintSeedVariants: state => name => {
            for(let keyword of state.paintSeedVariantKeywords) {
                if(name.search(keyword) > -1) return true
            }

            return false
        },
        itemOwnerSteamId: state => inspectLink => {
            return inspectLink
                .substr(inspectLink.search(state.inspectLinkSteamIdKeyword))
                .substr(...state.inspectLinkSteamIdRange)
        },
        steamHashName: state => hashName => {
            state.phases.forEach(phase => {
                let position = hashName.search(phase)
                
                if(position > -1) {
                    hashName = hashName
                        .substr(0, position)
                        .trim()
                        
                    return
                }
            })

            return hashName
        }
    },
    mutations: {},
    actions: {
        async getItemInfo({rootState, getters, dispatch}, item) {
            item._alerts = []

            if(!item.paintseed) {
                const { success, data } = await new Promise(resolve => chrome.runtime.sendMessage({
                    service: rootState.app.services.csgoFloat.name,
                    data: {
                        path: `${rootState.app.services.csgoFloat.api.INSPECT_ITEM}?url=${item.inspect_url}`
                    }
                },
                response => resolve(response)))

                if(!success || !data.iteminfo) return

                item.floatvalue = roundNumber(data.iteminfo.floatvalue, 7)
                item.paintseed = data.iteminfo.paintseed
                item.paintindex = data.iteminfo.paintindex
            }

            if(item.floatvalue && rootState.item.highRankFloat >= item.floatvalue) {
                dispatch('app/pushAlert',{
                    type: rootState.app.alertTypes.INFO,
                    persistent: true,
                    message: `${item.steam_market_hash_name} <br> ${item.floatvalue} <br> $ ${item.price_market_usd}`
                }, { root: true })
                .then(id => item._alerts.push(id))
            }

            if(!getters.hasPaintSeedVariants(item.steam_short_name)) return

            dispatch('getRarePaintSeedItems', item)
            .then(({success, data}) => {
                if(success && data.length) {
                    item._variant = data[0].variant

                    dispatch('app/pushAlert',{
                        type: rootState.app.alertTypes.INFO,
                        persistent: true,
                        message: `${item.steam_market_hash_name} <br> ${item._variant} <br> $ ${item.price_market_usd}`
                    }, { root: true })
                    .then(id => item._alerts.push(id))
                }
            })
        },
        getRarePaintSeedItems({rootState}, {steam_short_name, paintseed}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.RARE_PAINT_SEED_ITEMS}?search=${steam_short_name}&paint_seed=${paintseed}`,
                    config: {
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`
                        }
                    }
                }
            }, 
            response => resolve(response)))
        },
        loadShadowpayStatistics({rootState}, hashName) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.SHADOWPAY_MARKET}?search=${hashName}`,
                }
            }, 
            response => resolve(response)))
        }
    }
}