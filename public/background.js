const apiUrl = 'http://conduit.ddns.net/api/v1'

const apiEndpoints = Object.freeze({
    USER: '/user',
    PRESETS: '/shadowpay-bot-presets',
    CONFIGS: '/shadowpay-bot-configs',
    FRIENDS: '/shadowpay-friends',
    STEAM_MARKET: '/steam-market-csgo-items',
    SHADOWPAY_MARKET: '/shadowpay-sold-items',
    SALE_GUARD: '/shadowpay-sale-guard-items',
    BLUE_GEM_ITEMS: '/csgo-blue-gem-items'
})

const apiFetch = (path, token, callback, config = {}) => {
    config.headers = {
        ...config.headers, 
        ...{
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    fetch(`${apiUrl + path}`, config)
        .then(res => res.json())
        .then(data => callback(data))
        .catch(err => callback({
            success: false, 
            error_message: `${err}`
        })
    )
}

const setItemsCounter = counter => {
    chrome.storage.local.set({
        itemsCounter: counter
    })
}

const getItemsCounter = callback => {
    chrome.storage.local.get(['itemsCounter'], ({itemsCounter}) => callback(itemsCounter))
}

chrome.runtime.onStartup.addListener(() => setItemsCounter(0))

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(sender.origin) {
        case 'https://shadowpay.com':
            const {action, params} = request

            switch(action) {
                case 'buy_item':
                    getItemsCounter((itemsCounter) => {
                        itemsCounter++

                        setItemsCounter(itemsCounter)
                        sendResponse({
                            data: itemsCounter
                        })
                    })
                    break

                case 'get_bought_items_counter':
                    getItemsCounter((itemsCounter) => {
                        sendResponse({
                            data: itemsCounter
                        })
                    })
                    break

                case 'authenticate':
                    apiFetch(
                        apiEndpoints.USER, 
                        params.token,
                        data => sendResponse(data)
                    )
                    break

                // presets
                case 'get_presets':
                    apiFetch(
                        `${apiEndpoints.PRESETS}?offset=${params.offset}&limit=${params.limit}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break

                case 'set_preset':
                    apiFetch(
                        `${apiEndpoints.PRESETS}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: 'preset=' + JSON.stringify(params.preset)
                        }
                    )
                    break

                case 'update_preset':
                    apiFetch(
                        `${apiEndpoints.PRESETS}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: 'preset=' + JSON.stringify(params.preset)
                        }
                    )
                    break

                case 'delete_preset':
                    apiFetch(
                        `${apiEndpoints.PRESETS}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'DELETE'
                        }
                    )
                    break
                // presets

                // config
                case 'get_config':
                    apiFetch(
                        `${apiEndpoints.CONFIGS}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break

                case 'set_config':
                    apiFetch(
                        `${apiEndpoints.CONFIGS}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: 'config=' + JSON.stringify(params.config)
                        }
                    )
                    break
                // config

                // friends
                case 'get_friends':
                    apiFetch(
                        `${apiEndpoints.FRIENDS}?offset=${params.offset}&limit=${params.limit}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break

                case 'set_friend':
                    apiFetch(
                        `${apiEndpoints.FRIENDS}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: `shadowpay_user_id=${params.shadowpayUserId}&name=${params.name}`
                        }
                    )
                    break

                case 'update_friend':
                    apiFetch(
                        `${apiEndpoints.FRIENDS}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: `shadowpay_user_id=${params.shadowpayUserId}&name=${params.name}`
                        }
                    )
                    break

                case 'delete_friend':
                    apiFetch(
                        `${apiEndpoints.FRIENDS}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'DELETE'
                        }
                    )
                    break
                //friends

                // sale guard
                case 'get_saleguard_items':
                    apiFetch(
                        `${apiEndpoints.SALE_GUARD}?offset=${params.offset}&limit=${params.limit}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break

                case 'set_saleguard_item':
                    apiFetch(
                        `${apiEndpoints.SALE_GUARD}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: `shadowpay_offer_id=${params.shadowpayOfferId}` +
                                `&hash_name=${params.hashName}` +
                                `&min_price=${params.minPrice}` +
                                `&max_price=${params.maxPrice}`
                        }
                    )
                    break

                case 'update_saleguard_item':
                    apiFetch(
                        `${apiEndpoints.SALE_GUARD}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: `shadowpay_offer_id=${params.shadowpayOfferId}` +
                                `&min_price=${params.minPrice}` +
                                `&max_price=${params.maxPrice}`
                        }
                    )
                    break

                case 'delete_saleguard_item':
                    apiFetch(
                        `${apiEndpoints.SALE_GUARD}/${params.id}`,
                        params.token,
                        data => sendResponse(data),
                        {
                            method: 'DELETE'
                        }
                    )
                    break
                // sale guard

                // steam
                case 'get_steam_market_csgo_item':
                    apiFetch(
                        `${apiEndpoints.STEAM_MARKET}/${params.hash_name}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break
                // steam

                // shadowpay
                case 'get_shadowpay_sold_item':
                    apiFetch(
                        `${apiEndpoints.SHADOWPAY_MARKET}?search=${params.hash_name}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break
                // shadowpay

                // blue gems
                case 'get_blue_gem':
                    apiFetch(
                        `${apiEndpoints.BLUE_GEM_ITEMS}?search=${params.item_type}&paint_seed=${params.paint_seed}`,
                        params.token,
                        data => sendResponse(data)
                    )
                    break
            }
            break
    }

    return true
})