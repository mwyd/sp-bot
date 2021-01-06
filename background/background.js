const apiUrl = 'https://conduitpower.fun/api';

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

                case 'auth':
                    fetch(`${apiUrl}/user/auth/`, {
                        'headers': {
                            'X-Auth': params.apiKey
                        }
                    })
                    .then(res => res.json())
                    .then(data => sendResponse({data: data}));
                    break;

                case 'get_price':
                    fetch(`${apiUrl}/item/stats/?hash_name=${params.hash_name}`, {
                        'headers': {
                            'X-Auth': params.apiKey
                        }
                    })
                    .then(res => res.json())
                    .then(data => sendResponse({data: data}));
                    break;
            }
            break;
    }

    return true;
})
