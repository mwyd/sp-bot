const botHTML = `
<div class="sp-bot-header__wrapper"><div><h1>SP-BOT</h1><div id="sp-bot-error-dot" class="button__green"></div></div><h1 id="money-spent">$ 0.00 / 0.00</h1></div>
<div id="sp-bot-content">
    <div id="sp-bot-settings__wrapper">
        <div id="sp-bot-settings">
            <h3>Options</h3>
            <div class="input-desc"><span>Hot deal %</span><input class="input__value-ok" id="hotDealIn" type="number" min="0" max="100"></div>
            <div class="input-desc"><span>Deal %</span><input class="input__value-ok" id="dealIn" type="number" min="0" max="100"></div>
            <div class="input-desc"><span>Item min price $</span><input class="input__value-ok" id="minPriceItemIn" type="number" min="0" step="0.01"></div>
            <div class="input-desc"><span>Money to spend $</span><input class="input__value-ok" id="moneyToSpendIn" type="number" min="0" step="0.01"></div>
            <div class="input-desc"><span>Refresh time s</span><input class="input__value-ok" id="refreshTimeIn" type="number" min="0" step="1"></div>
            <div class="input-desc"><span>Current preset</span><select class="input__value-ok" id="presets-select"></select></div>
            <div class="input-desc"><span>Auto refresh items</span><input id="auto-items-refresh" type="checkbox"></div>
            <button id="sp-bot-start-button" class="button__green">START</button>
        </div>
    </div>
    <div id="sp-bot-processed__wrapper">
        <div id="sp-bot-processed">
            <h3>Buy history</h3>
            <div id="processed-list-header">
                <div class="processed-list-col processed-list-item-name">Item</div>
                <div class="processed-list-col processed-list-price">Price</div>
                <div class="processed-list-col processed-list-status">Status</div>
                <div class="processed-list-col processed-list-date">Date</div>
                <div class="processed-list-col processed-list-seller">Seller</div>
            </div>
            <div id="processed-list">
                <div id="processed-list__active"></div>
                <div id="processed-list__finished"></div>
            </div>
        </div>
    </div>
</div>
`

function getDiffAsPercentage(num1, num2) {
    return Math.round((1 - (num1 / num2)) * 100)
}

function validateNumberInput(target, min, max) {
    if(target.value < min && min !== null) target.value = min
    if(target.value > max && max !== null) target.value = max
}

function getFullDate(dateObj, timeZoneDiff = 0) {
    dateObj.setTime(dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 500 * -timeZoneDiff)

    let day = String(dateObj.getDate()).padStart(2, '0')
    let month = String(dateObj.getMonth() + 1).padStart(2, '0')
    let year = dateObj.getFullYear()
    let hour = dateObj.getHours()
    let minutes = String(dateObj.getMinutes()).padStart(2, '0')
    let seconds = String(dateObj.getSeconds()).padStart(2, '0')

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
} 

function getCookie(cookieName) {
    let cookies = document.cookie.split(';')
    for(let cookie of cookies) {
        let cookieNameVal = cookie.split('=')
        cookieNameVal[0] = cookieNameVal[0].replace(/ /g,'')
        if(cookieNameVal[0] == cookieName) return cookieNameVal[1]
    }

    return ""
}

function fetchPOST(url, _body, callback) {
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: _body
    }).then(response => response.json())
      .then(data => callback(data))
      .catch(err => console.log(new Error(err)))
}

async function loadJsonFile(fileName) {
    let _browser = undefined
    let userAgent = navigator.userAgent

    if(userAgent.includes("Firefox")) _browser = browser
    else _browser = chrome

    const data = await fetch(_browser.extension.getURL(fileName))
    return data.json()
}

class SpBot {
    static allowedPaths = [
        '/en/',
        '/en'
    ]

    constructor() {
        this.runDelay = 4
        this.submitKeyCode = 13
        this.moneyAlreadySpent = 0
        this.csrfCookie = getCookie('csrf_cookie')
        this.pendingBuyItems = []
        this.isRunning = false
        this.refreshMarketplace = false
        this.notifiSound = new Audio('https://cdn.discordapp.com/attachments/336603302592512004/742418059632967772/Jestem_zrujnowany.mp3')
        this.initDate = getFullDate(new Date(), -2)
        this.ui = {}
        this.lastDocumentLoc = 'https://shadowpay.com/en'
        this.presets = new Map()

        this.presets.set('default', {
            'name': 'default',
            'hotDeal': 70,
            'deal': 50,
            'minPriceItem': 1.00,
            'moneyToSpend': 10.00,
            'searchItem': '',
            'priceTo': 12958.58
        })
        this.currentPreset = this.presets.get('default')

        this.apiUrls = {
            getItems: 'https://shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12958.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
            buyItem: 'https://shadowpay.com/api/market/buy_item',
            getBuyHistory: 'https://shadowpay.com/en/profile/get_bought_history'
        }

        this.initCsrfToken()
        this.initUi()
    }

    initCsrfToken() {
        if(this.csrfCookie == '') {
            fetchPOST(this.apiUrls.buyItem, `id=0&price=0&csrf_token=${this.csrfCookie}`, data => {
                if(data.status == "error")
                    if(data.error_message == "wrong_token") this.csrfCookie = getCookie('csrf_cookie')
            })
        }
    }

    async initUi() {
        //create bot header
        this.ui.botHeader = document.createElement('div')
        this.ui.botHeader.setAttribute('class', 'sp-bot-header')
        this.ui.botHeader.innerHTML = botHTML

        document.querySelector('.justify-content-center.marketplace-header').before(this.ui.botHeader)

        //set up bot ui
        this.ui.marketplaceSearch = document.querySelector('div.marketplace-inventory-search').childNodes[0]
        this.ui.toggleVisible = document.querySelector(".sp-bot-header__wrapper")
        this.ui.autoRefreshItems = document.querySelector('#auto-items-refresh')
        this.ui.startStopBtn = document.querySelector("#sp-bot-start-button")
        this.ui.hotDealIn = document.querySelector("#hotDealIn")
        this.ui.dealIn = document.querySelector("#dealIn")
        this.ui.minPriceItemIn = document.querySelector("#minPriceItemIn")
        this.ui.moneyToSpendIn = document.querySelector("#moneyToSpendIn")
        this.ui.refreshTimeIn = document.querySelector('#refreshTimeIn')
        this.ui.processedListActive = document.querySelector("#processed-list__active")
        this.ui.processedListFinished = document.querySelector("#processed-list__finished")
        this.ui.moneySpentContainer = document.querySelector('#money-spent')
        this.ui.marketplaceRefresher = document.querySelector('a.refresh, a.marketplace-clear')
        this.ui.presetsSelect = document.querySelector('#presets-select')
        this.ui.errorDot = document.querySelector('#sp-bot-error-dot')

        this.setupFilterInputs()

        this.ui.marketplaceSearch.style.borderRadius = "5px"
        this.ui.marketplaceSearch.classList.add('input__value-ok')

        //search btn events
        this.ui.marketplaceSearch.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.searchItem))
        this.ui.marketplaceSearch.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                this.currentPreset.searchItem = e.target.value
                this.updateSearchItemParm()
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })

        //error dot
        this.ui.errorDot.addEventListener('click', e => {
            if(e.target.getAttribute('class') == 'button__red') e.target.setAttribute('class', 'button__green')
        })

        //startstop btn events
        this.ui.startStopBtn.addEventListener('click', (e) => {
            if(this.isRunning) {
                this.isRunning = false
                this.ui.startStopBtn.setAttribute('class', 'button__green')
                e.target.innerHTML = "START"
                for(let pendingBuyItem of this.pendingBuyItems) pendingBuyItem.current_run = false
            }
            else {
                this.isRunning = true
                this.ui.startStopBtn.setAttribute('class', 'button__red')
                e.target.innerHTML = "STOP"
                this.moneyAlreadySpent = 0
            }
        })

        //togglevisible btn events
        this.ui.toggleVisible.addEventListener("click", () => {
            let spBotContent = document.querySelector("#sp-bot-content")
            if(spBotContent.style.display == "flex" || spBotContent.style.display == "") spBotContent.style.display = "none"
            else spBotContent.style.display = "flex"
        })

        //auto refresh items checkbox events
        this.ui.autoRefreshItems.addEventListener('click', (e) => {
            e.target.checked ? this.refreshMarketplace = true : this.refreshMarketplace = false
        })

        //input filters events

        //hotdeal
        this.ui.hotDealIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.hotDeal))
        this.ui.hotDealIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.hotDeal))
        this.ui.hotDealIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, 100)
                this.currentPreset.hotDeal = parseInt(e.target.value)
                e.target.value = this.currentPreset.hotDeal
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })

        //deal
        this.ui.dealIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.deal))
        this.ui.dealIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.deal))
        this.ui.dealIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, 100)
                this.currentPreset.deal = parseInt(e.target.value)
                e.target.value  = this.currentPreset.deal
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })

        //refresh time
        this.ui.refreshTimeIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.runDelay))
        this.ui.refreshTimeIn.addEventListener('input', e => this.inputOnInput(e, this.runDelay))
        this.ui.refreshTimeIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, 10)
                this.runDelay = parseInt(e.target.value)
                e.target.value = this.runDelay
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })        

        //min price item
        this.ui.minPriceItemIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.minPriceItem.toFixed(2)))
        this.ui.minPriceItemIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.minPriceItem))
        this.ui.minPriceItemIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, null)
                if(e.target.value < this.currentPreset.moneyToSpend) {
                    this.currentPreset.minPriceItem = parseFloat(e.target.value)
                } 
                else {
                    this.currentPreset.minPriceItem = this.currentPreset.moneyToSpend
                    e.target.value = this.currentPreset.moneyToSpend
                }
                e.target.value = this.currentPreset.minPriceItem.toFixed(2)
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })

        //money to spend
        this.ui.moneyToSpendIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.moneyToSpend.toFixed(2)))
        this.ui.moneyToSpendIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.moneyToSpend))
        this.ui.moneyToSpendIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, null)
                if(e.target.value > this.currentPreset.minPriceItem) {
                    this.currentPreset.moneyToSpend = parseFloat(e.target.value)
                }
                else {
                    this.currentPreset.moneyToSpend = this.currentPreset.minPriceItem
                    e.target.value = this.currentPreset.minPriceItem
                }
                e.target.value = this.currentPreset.moneyToSpend.toFixed(2)
                e.target.classList.replace('input__value-not-ok', 'input__value-ok')
            }
        })

        //set up presets select
        let presets = await loadJsonFile('presets.json')
        this.ui.presetsSelect.innerHTML = `<option name="${this.currentPreset.name}">${this.currentPreset.name}</option>`
        for(let preset of presets) {
            this.presets.set(preset.name, preset)
            this.ui.presetsSelect.innerHTML += `<option name="${preset.name}">${preset.name}</option>`
        }
        this.ui.presetsSelect.addEventListener('change', e => {
            this.currentPreset = this.presets.get(e.target.value)

            this.updateSearchItemParm()
            this.setupFilterInputs()
            this.ui.marketplaceSearch.value = this.currentPreset.searchItem
            this.ui.marketplaceSearch.dispatchEvent(new KeyboardEvent('input'))
            this.ui.marketplaceRefresher.click()
        })
    }

    inputOnFocusOut(e, botVar) {
        e.target.value = botVar
        e.target.classList.replace('input__value-not-ok', 'input__value-ok')
    }

    inputOnInput(e, botVar) {
        botVar == e.target.value ? e.target.classList.replace('input__value-not-ok', 'input__value-ok') : e.target.classList.replace('input__value-ok', 'input__value-not-ok')
    }

    setupFilterInputs() {
        this.ui.hotDealIn.value = this.currentPreset.hotDeal
        this.ui.dealIn.value = this.currentPreset.deal
        this.ui.minPriceItemIn.value = this.currentPreset.minPriceItem.toFixed(2)
        this.ui.moneyToSpendIn.value = this.currentPreset.moneyToSpend.toFixed(2)
        this.ui.refreshTimeIn.value = this.runDelay

        let priceToFilter = document.querySelectorAll('.marketplace-range-value__input')[1]
        priceToFilter.value = this.currentPreset.priceTo.toFixed(2)
        priceToFilter.dispatchEvent(new Event('change'))
    }

    buildBoughtItemContainer(item) {
        return `<div class="processed-list-row item-state-${item.state}">
        <div class="processed-list-col processed-list-item-name">
            <a target="_blank" href="https://steamcommunity.com/market/listings/730/${item.steam_market_hash_name}">
                <img style="padding-right: 10px;" height="50px" src="https://community.cloudflare.steamstatic.com/economy/image/${item.item.icon_url}">
            ${item.steam_market_hash_name}</a>
        </div>
        <div class="processed-list-col processed-list-price">$ ${item.price} ${item.discount_real > 0 ? '<sup>-' + item.discount_real + '%</sup>': ''}</div>
        <div class="processed-list-col processed-list-status">${item.state}</div>
        <div class="processed-list-col processed-list-date">${getFullDate(new Date(item.time_finished), 2)}</div>
        <div class="processed-list-col processed-list-seller">
            <a target="_blank" href="https://steamcommunity.com/profiles/${item.steamid}">
                <img height="20px" src="https://cdn2.iconfinder.com/data/icons/gaming-platforms-logo-shapes/250/steam_logo-24.png">
            </a>
        </div>
    </div>`
    }

    updateBuyHistory() {
        fetchPOST(this.apiUrls.getBuyHistory, `page=1&limit=1&sort_column=id&sort_dir=asc&custom_id=&date_start=${this.initDate}&date_end=&state=all`, data => {
            fetchPOST(this.apiUrls.getBuyHistory, `page=1&limit=${data.total_items}&sort_column=time_finished&sort_dir=desc&custom_id=&date_start=${this.initDate}&date_end=&state=all`, data => {
                let processedItemsActiveListHTML = ''
                switch(data.status) {
                    case 'success':
                        for(let i = 0; i < this.pendingBuyItems.length; i++) {
                            let historyItem = data.items.find(item => item.id == this.pendingBuyItems[i].id)
                            if(historyItem !== undefined) {
                                historyItem.discount_real = this.pendingBuyItems[i].discount_real
                                historyItem.current_run = this.pendingBuyItems[i].current_run
                                switch(historyItem.state) {
                                    case 'cancelled':
                                        this.pendingBuyItems.splice(i, 1)
                                        if(historyItem.current_run) this.moneyAlreadySpent -= parseFloat(historyItem.price)
                                        this.ui.processedListFinished.innerHTML = this.buildBoughtItemContainer(historyItem) + this.ui.processedListFinished.innerHTML
                                        break

                                    case 'finished':
                                        this.pendingBuyItems.splice(i, 1)
                                        this.ui.processedListFinished.innerHTML = this.buildBoughtItemContainer(historyItem) + this.ui.processedListFinished.innerHTML
                                        if(this.pendingBuyItems.length == 0 && Math.abs(this.moneyAlreadySpent - this.currentPreset.moneyToSpend) < this.currentPreset.minPriceItem) this.ui.startStopBtn.click()
                                        break

                                    case 'active':
                                        processedItemsActiveListHTML += this.buildBoughtItemContainer(historyItem)
                                        break
                                }
                            }
                        }
                        break
                }
                this.ui.processedListActive.innerHTML = processedItemsActiveListHTML
            })
        })
    }

    updateSearchItemParm() {
        let giURL = new URL(this.apiUrls.getItems)
        giURL.searchParams.set('search', this.currentPreset.searchItem)
        this.apiUrls.getItems = giURL.toString()
    }

    updateGetItemsUrl() {
        let dlhURL = new URL(document.location.href)
    
        if(SpBot.allowedPaths.includes(dlhURL.pathname)) {
            if(document.location.href != this.lastDocumentLoc) {
                this.lastDocumentLoc = document.location.href
                let giURL = new URL(this.apiUrls.getItems)
        
                dlhURL.searchParams.forEach((val, key) => giURL.searchParams.set(key, val))
                this.apiUrls.getItems = giURL.toString()
            }
    
            if(this.refreshMarketplace) this.ui.marketplaceRefresher.click()
        }
    }

    proceedBuy(itemList) {
        for(let item of itemList) {
            if(parseFloat(item.price_market) + this.moneyAlreadySpent <= this.currentPreset.moneyToSpend) {
                fetchPOST(this.apiUrls.buyItem, `id=${item.id}&price=${item.price_market}&csrf_token=${this.csrfCookie}`, data => {
                    switch(data.status) {
                        case "error":
                            switch(data.error_message) {
                                case 'wrong_token':
                                    this.csrfCookie = getCookie('csrf_cookie')
                                    break
                            }
                            this.moneyAlreadySpent -= parseFloat(item.price_market)
                            break
                        
                        case "success":
                            this.pendingBuyItems.push({id: data.id, discount_real: item.discount_real, current_run: true})
                            this.notifiSound.play()
                            break
                    }
                    console.log('Buy info', data)
                })
                this.moneyAlreadySpent += parseFloat(item.price_market)
            }
        }
    }

    async run() {
        while(true) {
            if(this.isRunning) {
                this.updateGetItemsUrl()
                if(Math.abs(this.moneyAlreadySpent - this.currentPreset.moneyToSpend) >= this.currentPreset.minPriceItem) {
                    try {    
                        const response = await fetch(this.apiUrls.getItems)
                        let data = await response.json()

                        if(data.status == "success") {
                            let itemList = Array.from(data.items)
                
                            itemList = itemList.filter(item => !item.is_my_item)
                            itemList = itemList.filter(item => {
                                item.discount_real = getDiffAsPercentage(item.price_market, item.price_real)
                                return (item.discount_real >= this.currentPreset.deal && item.price_market >= this.currentPreset.minPriceItem) || item.discount_real >= this.currentPreset.hotDeal
                            })
                
                            itemList.sort((itemC, itemN) => { 
                                let itemCPriceF = parseFloat(itemC.price_market)
                                if(itemCPriceF < itemN.price_market) return 1
                                if(itemCPriceF > itemN.price_market) return -1        
                                return 0
                            })
                
                            if(itemList.length > 0) console.log('Filtered items', itemList)
                            this.proceedBuy(itemList)
                        }
                    }
                    catch(err) {
                        this.ui.errorDot.setAttribute('class', 'button__red')
                        console.log(new Error(err))
                    }
                }
                console.log(this)
                if(this.pendingBuyItems.length != 0) this.updateBuyHistory()
                this.ui.moneySpentContainer.innerHTML = `$ ${this.moneyAlreadySpent.toFixed(2)} / ${this.currentPreset.moneyToSpend.toFixed(2)}`
            }
            await new Promise(r => setTimeout(r, this.runDelay * 1000))
        }
    }
}

function init() {
    if(document.readyState == "complete") {
        let dlhURL = new URL(document.location.href)
        if(SpBot.allowedPaths.includes(dlhURL.pathname)) {
            const spBot = new SpBot()
            spBot.run()
        }
    }
    else init()
}

window.addEventListener('load', init)
