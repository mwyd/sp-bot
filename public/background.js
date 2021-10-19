const services = Object.freeze({
    conduit: {
        name: 'conduit',
        baseApiUrl: 'https://conduit.ddns.net/api/v1'
    },
    csgoFloat: {
        name: 'csgo_float'
    },
    self: {
        name: 'self',
        actions: {
            INCREMENT_BUY_COUNTER: 'increment_buy_counter',
            GET_BUY_COUNTER: 'get_buy_counter'
        }
    }
})

const setBuyCounter = counter => {
    chrome.storage.local.set({ buyCounter: counter })
}

const getBuyCounter = callback => {
    chrome.storage.local.get(['buyCounter'], ({ buyCounter }) => callback(buyCounter))
}

chrome.runtime.onStartup.addListener(() => setBuyCounter(0))

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(sender.origin != 'https://shadowpay.com') return false

    const { service, data } = request

    switch(service) {
        case services.self.name:
            switch(data.action) {
                case services.self.actions.INCREMENT_BUY_COUNTER:
                    getBuyCounter(buyCounter => {
                        buyCounter++

                        setBuyCounter(buyCounter)
                        sendResponse({ data: buyCounter })
                    })
                    break

                case services.self.actions.GET_BUY_COUNTER:
                    getBuyCounter(buyCounter => sendResponse({ data: buyCounter }))
                    break
            }
            break

        case services.conduit.name:
            fetch(services.conduit.baseApiUrl + data.path, data.config ?? {})
            .then(res => res.json())
            .then(sendResponse)
            .catch(err => sendResponse({ success: false, error_message: err }))
            break

        case services.csgoFloat.name:
            fetch(data.path, data.config ?? {})
            .then(res => res.json())
            .then(data => sendResponse({ success: true, data: data }))
            .catch(err => sendResponse({ success: false, error_message: err }))
            break
    }

    return true
})