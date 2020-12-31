/*const apiKey = 'fmntq9bjg7-srnhfbqnsg';
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

                case 'get_script':
                    fetch(`${apiUrl}/bot/get_script?api_key=${apiKey}`)
                    .then(res => res.json()).then(data => sendResponse({data: data}));
                    break;

                case 'get_style':
                    fetch(`${apiUrl}/bot/get_style?api_key=${apiKey}`)
                    .then(res => res.json()).then(data => sendResponse({data: data}));
                    break;

                case 'get_price':
                    fetch(`${apiUrl}/item/get_price?api_key=${apiKey}&hash_name=${params.hash_name}`)
                    .then(res => res.json()).then(data => sendResponse({data: data}));
                    break;
            }
            break;
    }

    return true;
});
*/