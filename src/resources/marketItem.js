import { roundNumber } from '@/utils'
import { inspectTool } from '@/api/csgo_flaot'
import { rarePaintSeedItem } from '@/api/conduit'
import store from '@/store'
import alertType from '@/enums/alertType'
import itemSortType from '@/enums/itemSortType'

const inspectLinkSteamIdRange = [11, 17]

const inspectLinkSteamIdKeyword = 'preview'

const dopplerPhases = [
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Phase 4',
    'Emerald',
    'Ruby',
    'Sapphire',
    'Black Pearl'
]

const paintSeedVariantKeywords = [
    'Case Hardened',
    'Fade'
]

const highRankFloat = 1e-3

const profitableFloatRanges = [
    [0, 0.01],
    [0.07, 0.09],
    [0.15, 0.18],
    [0.18, 0.21],
    [0.45, 0.5],
    [0.76, 0.8]
]

const significantProperties = Object.freeze({
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
})

const shadowpayStatistics = Object.freeze({
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
})

const itemSortBy = new Map([
    [itemSortType.REAL_DISCOUNT, 
        {
            name: 'Steam discount',
            callback(asc) { 
                return (a, b) => ((b._real_discount ?? 0) - (a._real_discount ?? 0)) * (asc ? -1 : 1)
            }
        }
    ],
    [itemSortType.SHADOWPAY_DISCOUNT, 
        {
            name: 'Shadowpay discount',
            callback(asc) { 
                return (a, b) => (b.discount - a.discount) * (asc ? -1 : 1)
            }
        }
    ],
    [itemSortType.ITEM_FLOAT,
        {
            name: 'Item float',
            callback(asc) { 
                return (a, b) => ((b.floatvalue || 1) - (a.floatvalue || 1)) * (asc ? -1 : 1)
            }  
        }
    ],
    [itemSortType.MARKET_PRICE, 
        {
            name: 'Market price',
            callback(asc) { 
                return (a, b) => (b.price_market_usd - a.price_market_usd) * (asc ? -1 : 1)
            }  
        }
    ]
])

const isFloatProfitable = float => {
    for(let [min, max] of profitableFloatRanges) {
        if(float >= min && float <= max) return true
    }

    return false
}

const hasPaintSeedVariants = name => {
    for(let keyword of paintSeedVariantKeywords) {
        if(name.search(keyword) > -1) return true
    }

    return false
}

const getItemOwnerSteamId = inspectLink => {
    return inspectLink
        .substr(inspectLink.search(inspectLinkSteamIdKeyword))
        .substr(...inspectLinkSteamIdRange)
}

const normalizeMarketItem = item => {
    item.discount = Math.round(item.discount)
    item.price_market_usd = parseFloat(item.price_market_usd)
    item._search_steam_hash_name = item.steam_market_hash_name.toLowerCase()
    item._conduit_hash_name = item.steam_market_hash_name

    for(let phase of dopplerPhases) {
        let position = item.steam_market_hash_name.search(phase)

        if(position > -1) {
            item.steam_market_hash_name = item.steam_market_hash_name
                .substr(0, position)
                .trim()

            item._conduit_hash_name = item.steam_market_hash_name.replace('(', `${phase} (`)
                
            break
        }
    }
}

const createRareItemAlert = item => ({
    type: alertType.INFO,
    persistent: true,
    message: `
        <span>${item.steam_market_hash_name}</span>
        <br> 
        <span style="color: yellow;">${item._variant || item.floatvalue}</span>
        <br>
        <span>
            <span style="color: greenyellow;">$</span> 
            ${item.price_market_usd} / ${item.steam_price_en}
        </span>
    `
})

const inspectItem = async (item, showAlerts = true) => {
    item._alerts = []

    if(!item.paintseed) {
        const { success, data } = await inspectTool.get(item.inspect_url)

        if(!success || !data.iteminfo) return

        item.floatvalue = roundNumber(data.iteminfo.floatvalue, 7)
        item.paintseed = data.iteminfo.paintseed
        item.paintindex = data.iteminfo.paintindex
    }

    if(item.floatvalue && highRankFloat >= item.floatvalue && showAlerts) {
        store.dispatch('app/pushAlert', createRareItemAlert(item), { root: true })
            .then(id => item._alerts.push(id))
    }

    if(!hasPaintSeedVariants(item.steam_short_name)) return

    rarePaintSeedItem.get(store.state.session.token, item)
        .then(({ success, data }) => {
            if(!success || data?.length == 0) return

            item._variant = data[0].variant

            if(showAlerts) {
                store.dispatch('app/pushAlert', createRareItemAlert(item), { root: true })
                    .then(id => item._alerts.push(id))
            }
        })
}

export {
    significantProperties,
    shadowpayStatistics,
    itemSortBy,
    isFloatProfitable,
    hasPaintSeedVariants,
    getItemOwnerSteamId,
    normalizeMarketItem,
    inspectItem
}