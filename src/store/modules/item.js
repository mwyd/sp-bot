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
                name: '',
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
                    func: function(asc) { 
                        return (a, b) => ((b._real_discount ?? 0) - (a._real_discount ?? 0)) * (asc ? -1 : 1)
                    }
                }
            ],
            [1, 
                {
                    name: 'Shadowpay discount',
                    func: function(asc) { 
                        return (a, b) => (b.discount - a.discount) * (asc ? -1 : 1)
                    }
                }
            ],
            [2,
                {
                    name: 'Item float',
                    func: function(asc) { 
                        return (a, b) => ((b.floatvalue || 1) - (a.floatvalue || 1)) * (asc ? -1 : 1)
                    }  
                }
            ],
            [3, 
                {
                    name: 'Market price',
                    func: function(asc) { 
                        return (a, b) => (b.price_market_usd - a.price_market_usd) * (asc ? -1 : 1)
                    }  
                }
            ]
        ])
    }),
    getters: {
        interestingFloat: state => float =>  {
            for(let range of state.interestingFloatRanges) {
                if(float >= range.min && float <= range.max) return true
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
        async copyInspectLink({rootState, dispatch}, inspectLink) {
            const alert = {
                type: rootState.app.alertTypes.SUCCESS,
                message: 'Copied'
            }

            try {
                await navigator.clipboard.writeText(inspectLink)
            }
            catch(err) {
                alert.type = rootState.app.alertTypes.ERROR
                alert.message = 'Copy error'
            }

            dispatch('app/updateAlerts', alert, { root: true })
        },
        getBlueGem({rootState}, {itemType, paintSeed}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'get_blue_gem', 
                params: {
                    token: rootState.session.token,
                    item_type: itemType,
                    paint_seed: paintSeed
                }
            }, 
            response => resolve(response)))
        },
        loadShadowpayStatistics({rootState}, hashName) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'get_shadowpay_sold_item', 
                params: {
                    token: rootState.session.token,
                    hash_name: hashName
                }
            }, 
            response => resolve(response)))
        }
    }
}