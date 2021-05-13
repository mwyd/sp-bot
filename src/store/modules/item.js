export default {
    namespaced: true,
    state: () => ({
        inspectLinkSteamIdRange: [11, 17],
        inspectLinkSteamIdKeyword: 'preview', 
        interestingFloatRanges: [
            {min: 0, max: 0.01},
            {min: 0.07, max: 0.09},
            {min: 0.15, max: 0.18},
            {min: 0.18, max: 0.21},
            {min: 0.45, max: 0.5},
            {min: 0.76, max: 0.8}
        ],
        interestingProperties: [
            {raw: 'paintindex', sugar: 'Paint index', unit: ''},
            {raw: 'paintseed', sugar: 'Paint seed', unit: ''},
            {raw: 'phase', sugar: '', unit: ''},
            {raw: 'steam_is_souvenir', sugar: 'Souvenir', unit: ''},
            {raw: '_app_income', sugar: 'Income', unit: '$'},
            {raw: '_app_income_percentage', sugar: 'Income', unit: '%'},
            {raw: 'price_real', sugar: 'Suggested price', unit: '$'},
            {raw: '_steam_price', sugar: 'Steam price', unit: '$'},
            {raw: '_steam_volume', sugar: 'Steam volume', unit: ''}
        ],
        interestingMarketProperties: [
            {raw: '_items_on_market', sugar: 'Items on market', unit: ''},
            {raw: '_avg_item_price', sugar: 'Average item price', unit: '$'},
            {raw: '_market_cheapest', sugar: 'The cheapest one', unit: '$'},
            {raw: '_market_expensive', sugar: 'The most expensive one', unit: '$'},
            {raw: '_market_avg_discount', sugar: 'Market average discount', unit: '$'}
        ],
        interestingStatistics: [
            {raw: '_app_sell_price', sugar: 'Average sell price', unit: '$'},
            {raw: '_avg_discount', sugar: 'Average discount', unit: '%'},
            {raw: '_sold', sugar: 'Sold', unit: ''},
            {raw: '_last_sold', sugar: 'Last sold', unit: ''}
        ]
    }),
    getters: {
        interestingFloat: state => float =>  {
            for(let range of state.interestingFloatRanges) {
                if(float >= range.min && float <= range.max) return true
            }
            return false
        },
        itemOwnerSteamId: state => inspectLink => {
            return inspectLink.substr(inspectLink.search(state.inspectLinkSteamIdKeyword)).substr(...state.inspectLinkSteamIdRange)
        }
    },
    mutations: {},
    actions: {}
}