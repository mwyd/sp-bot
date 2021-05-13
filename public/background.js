const apiUrl = 'http://localhost/conduit-laravel/public/api'

let boughtItemsCounter = 0
let apiToken = ''

const apiEndpoints = Object.freeze({
    USER: '/user',
    PRESETS: '/shadowpay-bot-presets',
    CONFIGS: '/shadowpay-bot-configs',
    STEAM_MARKET: '/steam-market-csgo-items',
    SHADOWPAY_MARKET: '/shadowpay-sold-items',
    SALE_GUARD: '/shadowpay-sale-guard-items'
})

const apiFetch = (path, callback, config = {}) => {
    config.headers = {
        ...config.headers, 
        ...{
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    }

    fetch(`${apiUrl + path}`, config)
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => callback({
        success: false, 
        error_message: err
    }))
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(sender.origin) {
        case 'https://shadowpay.com':
            const {action, params} = request

            switch(action) {
                case 'buy_item':
                    boughtItemsCounter = boughtItemsCounter + 1
                    sendResponse({data: boughtItemsCounter})
                    break

                case 'get_bought_items_counter':
                    sendResponse({data: boughtItemsCounter})
                    break

                case 'authenticate':
                    apiToken = params.token
                    apiFetch(apiEndpoints.USER, data => sendResponse(data))
                    break

                case 'get_presets':
                    apiFetch(`${apiEndpoints.PRESETS}?offset=${params.offset}&limit=${params.limit}`, data => sendResponse(data))
                    break

                case 'set_preset':
                    apiFetch(`${apiEndpoints.PRESETS}/${params.presetId}`, data => sendResponse(data), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'preset=' + JSON.stringify(params.config)
                    })
                    break

                case 'get_config':
                    apiFetch(`${apiEndpoints.CONFIGS}`, data => sendResponse(data))
                    break

                case 'set_config':
                    apiFetch(`${apiEndpoints.CONFIGS}`, data => sendResponse(data), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'config=' + JSON.stringify(params.config)
                    })
                    break

                case 'get_steam_market_csgo_item':
                    apiFetch(`${apiEndpoints.STEAM_MARKET}/${params.hash_name}`, data => sendResponse(data))
                    break

                case 'get_shadowpay_sold_item':
                    apiFetch(`${apiEndpoints.SHADOWPAY_MARKET}?search=${params.hash_name}`, data => sendResponse(data))
                    break

                case 'get_saleguard_items':
                    apiFetch(`${apiEndpoints.SALE_GUARD}?offset=${params.offset}&limit=${params.limit}`, data => sendResponse(data))
                    break

                case 'set_saleguard_item':
                    apiFetch(`${apiEndpoints.SALE_GUARD}`, data => sendResponse(data), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'item=' + JSON.stringify(params.item)
                    })
                    break

                case 'update_saleguard_item':
                    apiFetch(`${apiEndpoints.SALE_GUARD}/${params.conduitId}`, data => sendResponse(data), {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'item=' + JSON.stringify(params.item)
                    })
                    break

                case 'delete_saleguard_item':
                    apiFetch(`${apiEndpoints.SALE_GUARD}/${params.conduitId}`, data => sendResponse(data), {
                        method: 'DELETE'
                    })
                    break
            }
            break
    }

    return true
})