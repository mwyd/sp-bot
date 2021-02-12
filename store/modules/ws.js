const gsWs = {
    state: () => ({
        ws: null,
        reconnectTimeout: 10000,
        keepReconnect: true
    }),
    getters: {},
    mutations: {},
    actions: {
        initWs(context) {
            if(!context.getters.remoteAccess || !context.state.keepReconnect) return;

            let ws = new WebSocket('wss://conduitpower.fun/ws')

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    action: 'open',
                    endpoint: 'sp-bot',
                    apiKey: context.getters.apiKey,
                }))
            }

            ws.onmessage = e => {
                const response = JSON.parse(e.data)

                switch(response.action) {
                    case 'close':
                        switch(response.message) {
                            case 'slot_occupied':
                                context.state.keepReconnect = false;
                                spbLog('[WS] Unable to connect: slot occupied', '');
                                break;
                        }
                        break;
                }
            }

            ws.onclose = () => {
                setTimeout(() => {context.dispatch('initWs')}, context.state.reconnectTimeout);
            }

            context.state.ws = ws
        },
        wsSend(context, msg) {
            const ws = context.state.ws;
            if(ws) {
                if(ws.readyState == 1) ws.send(JSON.stringify(msg)); 
            }
        }
    }
}