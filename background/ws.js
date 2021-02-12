const reconnectTimeout = 10000;
let ws = null;

function initWs(apiKey, id) {
    ws = new WebSocket('wss://conduitpower.fun/ws');

    ws.onopen = () => {
        ws.send(JSON.stringify({
            action: 'open',
            endpoint: 'sp-bot',
            apiKey: apiKey,
            id: id
        }));
    }

    ws.onclose = () => {
        setTimeout(() => {initWs(apiKey, id)}, reconnectTimeout)
    }
}

function send(data) {
    if(ws) {
        if(ws.readyState == 1) ws.send(JSON.stringify(data));
    }
}

chrome.runtime.onConnect.addListener(port => {
    switch(port.name) {
        case 'ws':
            port.onMessage.addListener(msg => {
                const {action, data} = msg;

                switch(action) {
                    case 'open':
                        initWs(data.apiKey, port.sender.tab.id);
                        break;

                    case 'update_data':
                        send(data);
                        break;
                }
            });
            break;
    }
});