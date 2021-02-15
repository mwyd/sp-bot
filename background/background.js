const apiUrl = 'https://conduitpower.fun/api/v1';

let boughtItemsCounter = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(sender.origin) {
        case 'https://shadowpay.com':
            const {action, params} = request;

            switch(action) {
                case 'buy_item':
                    boughtItemsCounter++;
                    sendResponse({data: boughtItemsCounter});
                    break;

                case 'get_bought_items_counter':
                    sendResponse({data: boughtItemsCounter});
                    break;

                case 'authorize':
                    fetch(`${apiUrl}/user/name`, {
                        'headers': {
                            'X-Auth': params.apiKey
                        }
                    })
                    .then(res => res.json())
                    .then(data => sendResponse({data: data}))
                    .catch(err => spbLog('[ERR] unable to connect\n', err));
                    break;

                case 'steam_market':
                    fetch(`${apiUrl}/item/stats/steam?hash_name=${params.hash_name}`, {
                        'headers': {
                            'X-Auth': params.apiKey
                        }
                    })
                    .then(res => res.json())
                    .then(data => sendResponse({data: data}))
                    .catch(err => spbLog('[ERR] unable to connect\n', err));
                    break;

                case 'shadowpay_market':
                    fetch(`${apiUrl}/item/stats/shadowpay?hash_name=${params.hash_name}`, {
                        'headers': {
                            'X-Auth': params.apiKey
                        }
                    })
                    .then(res => res.json())
                    .then(data => sendResponse({data: data}))
                    .catch(err => spbLog('[ERR] unable to connect\n', err));
                    break;
            }
            break;
    }

    return true;
})
