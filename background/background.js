const apiUrl = 'https://conduitpower.fun/api/'
let apiKey = ''

chrome.storage.sync.get(['apiKey'], (items) => {
    apiKey = items.apiKey
})

let boughtItemsCounter = 0

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(sender.origin) {
        case 'https://shadowpay.com':
            const {action, params} = request

            switch(action) {
                case 'buy_item':
                    boughtItemsCounter++
                    sendResponse({data: boughtItemsCounter})
                    break

                case 'get_bought_items_counter':
                    sendResponse({data: boughtItemsCounter})
                    break

                /*case 'get_script':
                    fetch(`${apiUrl}/bot/get_script?api_key=${apiKey}`)
                    .then(res => res.json()).then(data => sendResponse({data: data}))
                    break

                case 'get_style':
                    fetch(`${apiUrl}/bot/get_style?api_key=${apiKey}`)
                    .then(res => res.json()).then(data => sendResponse({data: data}))
                    break*/

                case 'get_price':
                    fetch(`${apiUrl}/item/stats/?hash_name=${params.hash_name}`, {
                        'headers' : {
                            'X-Auth': apiKey
                        }
                    })
                    .then(res => res.json()).then(data => sendResponse({data: data}))
                    break
            }
            break
    }

    return true
})
