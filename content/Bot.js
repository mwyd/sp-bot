Vue.component('bot', {
    data: function() {
        return {
            settings: {
                runDelay: 4,
                hotDeal: 70,
                deal: 50,
                dealMargin: 0,
                minPrice: 1.00,
                maxPrice: 100,
                toSpend: 10.00,
                search: ''
            },
            moneyAlreadySpent: 0,
            csrfCookie: '',
            itemList: [],
            awaitingBuyItems: [],
            pendingBuyItems: [],
            isRunning: false,
            updateUrl: true,
            notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
            initDate: new Date(),
            apiUrls: {
                getItems: 'https://api.shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12558.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
                buyItem: 'https://api.shadowpay.com/api/market/buy_item',
                getBuyHistory: 'https://api.shadowpay.com/en/profile/get_bought_history'
            },
            DOM: {
                awaitingContainer: document.querySelector('.spb-history__awaiting'),
                activeContainer: document.querySelector('.spb-history__active'),
                finishedContainer: document.querySelector('.spb-history__finished')
            }
        }
    },
    template: `
        <div class="spb-bot-settings flex">
            <h3 class="spb-header-3">Options</h3>

            <div class="spb-flex">
                <div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Hot deal</span>
                            <input 
                            v-bind:value="settings.hotDeal" 
                            v-on:focusout="inFocusOut($event, 'hotDeal')" 
                            v-on:input="inInput($event, 'hotDeal')" 
                            v-on:keydown.enter="inEnter($event, 'hotDeal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item min price</span>
                            <input 
                            v-bind:value="settings.minPrice" 
                            v-on:focusout="inFocusOut($event, 'minPrice')" 
                            v-on:input="inInput($event, 'minPrice')" 
                            v-on:keydown.enter="inEnter($event, 'minPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal margin</span>
                            <input 
                            v-bind:value="settings.dealMargin" 
                            v-on:focusout="inFocusOut($event, 'dealMargin')" 
                            v-on:input="inInput($event, 'dealMargin')" 
                            v-on:keydown.enter="inEnter($event, 'dealMargin')" 
                            class="spb-bs__input input--val-ok" type="number" min="-100" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Search</span>
                            <input 
                            v-bind:value="settings.search" 
                            v-on:focusout="inFocusOut($event, 'search')" 
                            v-on:input="inInput($event, 'search')" 
                            v-on:keydown.enter="inEnter($event, 'search')" 
                            class="spb-bs__input input--val-ok" type="text" min="0" step="0.01">
                    </div>  
                </div>

                <div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal</span>
                            <input 
                            v-bind:value="settings.deal" 
                            v-on:focusout="inFocusOut($event, 'deal')" 
                            v-on:input="inInput($event, 'deal')" 
                            v-on:keydown.enter="inEnter($event, 'deal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>  
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item max price</span>
                            <input 
                            v-bind:value="settings.maxPrice" 
                            v-on:focusout="inFocusOut($event, 'maxPrice')" 
                            v-on:input="inInput($event, 'maxPrice')" 
                            v-on:keydown.enter="inEnter($event, 'maxPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Money to spend</span>
                            <input 
                            v-bind:value="settings.toSpend" 
                            v-on:focusout="inFocusOut($event, 'toSpend')" 
                            v-on:input="inInput($event, 'toSpend')" 
                            v-on:keydown.enter="inEnter($event, 'toSpend')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Refresh time</span>
                            <input 
                            v-bind:value="settings.runDelay" 
                            v-on:input="inInput($event, 'runDelay')" 
                            v-on:focusout="inFocusOut($event, 'runDelay')" 
                            v-on:keydown.enter="inEnter($event, 'runDelay')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="1">
                    </div>
                </div>
            </div>

            <button 
                v-on:click="run" 
                v-bind:class="'spb-bs__start-button ' + (isRunning ? 'spb-button--red' : 'spb-button--green')">
                {{ isRunning ? 'STOP' : 'START' }}
            </button>
        </div>
    `,
    methods: {
        toggleStart() {
            if(this.isRunning) {
                this.isRunning = false
                for(let pendingBuyItem of this.pendingBuyItems) pendingBuyItem.current_run = false
            }
            else {
                this.isRunning = true
                this.moneyAlreadySpent = 0
            }
        },
        updateGetItemsUrl() {
            if(this.updateUrl) {
                let getItemsURL = new URL(this.apiUrls.getItems)

                getItemsURL.searchParams.set('price_from', this.settings.minPrice)
                getItemsURL.searchParams.set('price_to', this.settings.maxPrice)
                getItemsURL.searchParams.set('search', this.settings.search)

                this.apiUrls.getItems = getItemsURL.toString()
                this.updateUrl = false
            }
        },
        buildAwaitingItemContainer(item) {
            let DOMElement = document.createElement('div')
            DOMElement.classList.add('spb-history-row', `spb-item-state-${item.state}`, 'spb-flex')
    
            DOMElement.innerHTML = '' +
                `<div class="spb-history__col spb-item-name">` +
                    `<a target="_blank" href="https://steamcommunity.com/market/listings/730/${item.steam_market_hash_name}">` +
                        `<img style="padding-right: 10px;" height="50px" src="https://community.cloudflare.steamstatic.com/economy/image/${item.steam_icon_url_large}">` +
                    `${item.steam_market_hash_name}</a>` +
                `</div>` +
                `<div class="spb-history__col spb-item-price">$ ${item.price_market} <sup>${item.discount_real !== undefined ? item.discount_real + '% |': ''} ${item.discount}%</sup></div>` +
                `<div class="spb-history__col spb-item-status">${item.state}</div>` +
                `<div class="spb-history__col spb-item-date"><button class="spb-buy-button spb-button--green">Buy now</button></div>`
    
            return DOMElement
        },
        addAwaitingItem(item) {
            if(this.awaitingBuyItems.findIndex(aItem => aItem.id == item.id) != -1) return
    
            item.DOMElement = this.buildAwaitingItemContainer(item)
            item.DOMElement.querySelector('.spb-buy-button').addEventListener('click', () => {this.proceedBuy(item)})
    
            this.DOM.awaitingContainer.prepend(item.DOMElement)
            this.awaitingBuyItems.push(item)
        },
        updateAwaitingItems() {        
            for(let i = this.awaitingBuyItems.length - 1; i >= 0; i--) {
                let item = this.itemList.find(item => item.id == this.awaitingBuyItems[i].id)
                
                if(item === undefined) {
                    this.awaitingBuyItems[i].DOMElement.remove()
                    this.awaitingBuyItems.splice(i, 1)
                    continue
                }
    
                if(item.price_market != this.awaitingBuyItems[i].price_market ) {
                    this.awaitingBuyItems[i].price = item.price
                    this.awaitingBuyItems[i].price_market = item.price_market
                    this.awaitingBuyItems[i].discount = item.discount
                    this.awaitingBuyItems[i].discount_real = getDiffAsPercentage(item.price_market, this.awaitingBuyItems[i].sp_bot_steam_price)
                    this.awaitingBuyItems[i].DOMElement.querySelector('.spb-item-price').innerHTML = `
                        $ ${this.awaitingBuyItems[i].price_market} <sup>${this.awaitingBuyItems[i].discount_real !== undefined ? this.awaitingBuyItems[i].discount_real + '% |': ''} ${this.awaitingBuyItems[i].discount}%</sup>`
                }
            }
        },
        proceedBuy(item, rePurchase = false) {
            if(rePurchase == false && this.pendingBuyItems.findIndex(pendingItem => pendingItem.itemId == item.id) != -1) return
            if(rePurchase == true || parseFloat(item.price_market) + this.moneyAlreadySpent <= this.settings.toSpend) {
                this.moneyAlreadySpent += parseFloat(item.price_market)
    
                const pendingBuyItem = {
                    id: undefined,
                    itemId: item.id,
                    discount: item.discount,
                    discount_real: item.discount_real,
                    current_run: true,
                    DOMElement: undefined,
                    status: 'pending'
                }
                this.pendingBuyItems.push(pendingBuyItem)
    
                fetch(this.apiUrls.buyItem, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `id=${item.id}&price=${item.price_market}&csrf_token=${this.csrfCookie}`
                })
                .then(res => res.json())
                .then(data => {
                    switch(data.status) {
                        case "error":
                            switch(data.error_message) {
                                case 'wrong_token':
                                    this.csrfCookie = data.token
                                    this.proceedBuy(item, true)
                                    break
                            }
    
                            pendingBuyItem.status = 'error'
                            this.moneyAlreadySpent -= parseFloat(item.price_market)
                            break
                            
                        case "success":
                            pendingBuyItem.id = data.id
                            pendingBuyItem.status = 'success'
                            
                            chrome.runtime.sendMessage({action: 'buy_item', params: {}})
                            this.notifiSound.play()
                            break;
                    }
                    //this.bLog('Buy info', data)
                    console.log(data)
                })
                .catch(err => {
                    pendingBuyItem.status = 'error'
                    this.moneyAlreadySpent -= parseFloat(item.price_market)
    
                    /*this.ui.errorDot.setAttribute('class', 'button__red');*/
                    //this.bLog('\n', new Error(err))
                    console.log(err)
                })
            }
        },
        buildBoughtItemContainer(item) {
            let DOMElement = document.createElement('div')
            DOMElement.classList.add('spb-history-row', `spb-item-state-${item.state}`, 'spb-flex')
    
            DOMElement.innerHTML = '' +
                `<div class="spb-history__col spb-item-name">` +
                    `<a target="_blank" href="https://steamcommunity.com/market/listings/730/${item.steam_market_hash_name}">` +
                        `<img style="padding-right: 10px;" height="50px" src="https://community.cloudflare.steamstatic.com/economy/image/${item.item.icon_url}">` +
                    `${item.steam_market_hash_name}</a>` +
                `</div>` +
                `<div class="spb-history__col spb-item-price">$ ${item.price} <sup>${item.discount_real !== undefined ? item.discount_real + '% |': ''} ${item.discount}%</sup></div>` +
                `<div class="spb-history__col spb-item-status">${item.state}</div>` +
                `<div class="spb-history__col spb-item-date">${getFullDate(new Date(item.time_finished), -2)}</div>` +
                `${item.state == 'active' ? '<div class="spb-item-timebar"></div>' : ''}`
    
            return DOMElement
        },
        updateBuyHistory() {
            chrome.runtime.sendMessage({action: 'get_bought_items_counter', params: {}}, res => {
                fetch(this.apiUrls.getBuyHistory, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `page=1&limit=${res.data}&sort_column=time_finished&sort_dir=desc&custom_id=&date_start=${getFullDate(new Date(this.initDate), -2)}&date_end=&state=all`
                })
                .then(res => res.json())
                .then(data => {
                    switch(data.status) {
                        case 'success':
                            for(let i = this.pendingBuyItems.length - 1; i >= 0 ; i--) {
                                if(this.pendingBuyItems[i].status == 'error') {
                                    this.pendingBuyItems.splice(i, 1)
                                    continue
                                }
    
                                let historyItem = data.items.find(item => item.id == this.pendingBuyItems[i].id)
                                if(historyItem === undefined) continue
    
                                historyItem.discount_real = this.pendingBuyItems[i].discount_real
                                historyItem.current_run = this.pendingBuyItems[i].current_run
                                historyItem.discount = this.pendingBuyItems[i].discount
    
                                switch(historyItem.state) {
                                    case 'cancelled':
                                        this.pendingBuyItems[i].DOMElement.remove()
                                        this.pendingBuyItems.splice(i, 1)
    
                                        if(historyItem.current_run) this.moneyAlreadySpent -= parseFloat(historyItem.price)
                                        this.DOM.finishedContainer.prepend(this.buildBoughtItemContainer(historyItem))
                                        break
    
                                    case 'finished':
                                        this.pendingBuyItems[i].DOMElement.remove()
                                        this.pendingBuyItems.splice(i, 1)
    
                                        this.DOM.finishedContainer.prepend(this.buildBoughtItemContainer(historyItem))
                                        if(this.pendingBuyItems.length == 0 && Math.abs(this.moneyAlreadySpent - this.settings.toSpend) < this.settings.minPrice) this.toggleStart()
                                        break
    
                                    case 'active':
                                        if(this.pendingBuyItems[i].DOMElement !== undefined) continue
                                        this.pendingBuyItems[i].DOMElement = this.buildBoughtItemContainer(historyItem)
                                        this.DOM.activeContainer.prepend(this.pendingBuyItems[i].DOMElement)
                                        break
                                    }
                            }
                            break
                    }
                })
                .catch(err => {
                    //this.ui.errorDot.setAttribute('class', 'button__red');
                    //this.bLog('\n', new Error(err))
                    console.log(err)
                })
            })
        },
        async run() {
            this.toggleStart()
            while(this.isRunning) {
                this.updateGetItemsUrl()
                this.itemList = []
                if(Math.abs(this.moneyAlreadySpent - this.settings.toSpend) >= this.settings.minPrice) {
                    try {    
                        const response = await fetch(this.apiUrls.getItems, {credentials: 'include'})
                        let data = await response.json()

                        if(data.status == "success") {
                            this.itemList = Array.from(data.items)
                
                            this.itemList = this.itemList.filter(item => !item.is_my_item)
                            this.itemList = this.itemList.filter(item => {
                                return (item.discount >= this.settings.deal && item.price_market >= this.settings.minPrice) || item.discount >= this.settings.hotDeal
                            })
                
                            this.itemList.sort((itemC, itemN) => { 
                                let itemCPriceF = parseFloat(itemC.price_market)
                                if(itemCPriceF < itemN.price_market) return 1
                                if(itemCPriceF > itemN.price_market) return -1
                                return 0
                            })

                            for(let item of this.itemList) {
                                chrome.runtime.sendMessage({action: 'get_price', params: {hash_name: item.steam_market_hash_name}}, res => {
                                    const {data} = res
                                    if(data.success) {
                                        item.sp_bot_steam_price = data.price_info.sell_price / 100
                                        item.discount_real = getDiffAsPercentage(item.price_market, item.sp_bot_steam_price)
                                        if(item.discount_real >= this.settings.deal + (this.settings.dealMargin) && data.price_info.volume > 1) this.proceedBuy(item)
                                        else this.addAwaitingItem(item)
                                    }
                                    else this.addAwaitingItem(item)
                                })
                            }

                            if(this.itemList.length > 0) console.log(this.itemList)
                        }
                    }
                    catch(err) {
                        /*this.ui.errorDot.setAttribute('class', 'button__red');
                        this.bLog('\n', new Error(err));*/
                        console.log(err)
                    }
                }
                //this.bLog('', this)
                if(this.pendingBuyItems.length > 0) this.updateBuyHistory()
                if(this.awaitingBuyItems.length > 0 ) this.updateAwaitingItems()
                //this.ui.moneySpentContainer.innerHTML = `$ ${this.moneyAlreadySpent.toFixed(2)} / ${this.currentPreset.moneyToSpend.toFixed(2)}`;
                    
                await new Promise(r => setTimeout(r, 1000 * this.settings.runDelay))
            }
        },
        validate(target, min, max) {
            if(max == null) return target >= min
            if(min == null) return target <= max
            
            return target <= max && target >= min
        },
        getOptionByName(name) {
            switch(name) {
                case 'hotDeal':
                    return this.settings.hotDeal

                case 'deal':
                    return this.settings.deal

                case 'dealMargin':
                    return this.settings.dealMargin

                case 'minPrice':
                    return this.settings.minPrice

                case 'maxPrice':
                    return this.settings.maxPrice

                case 'toSpend':
                    return this.settings.toSpend

                case 'search':
                    return this.settings.search

                case 'runDelay':
                    return this.settings.runDelay

                default:
                    return null
            }
        },
        inFocusOut(e, name) {
            let option = this.getOptionByName(name)
            if(option == null) return

            e.target.value = option
            e.target.classList.replace('input--val-wrong', 'input--val-ok') 
        },
        inInput(e, name) {
            let option = this.getOptionByName(name)
            if(option == null) return

            option == e.target.value ? e.target.classList.replace('input--val-wrong', 'input--val-ok') : e.target.classList.replace('input--val-ok', 'input--val-wrong')
        },
        inEnter(e, name) {
            switch(name) {
                case 'hotDeal':
                    if(this.validate(e.target.value, 0, 100)) {
                        this.settings.hotDeal = parseInt(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'deal':
                    if(this.validate(e.target.value, 0, 100)) {
                        this.settings.deal = parseInt(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'dealMargin':
                    if(this.validate(e.target.value, -this.settings.deal, (100 - this.settings.deal))) {
                        this.settings.dealMargin = parseInt(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'minPrice':
                    if(this.validate(e.target.value, 0, this.settings.maxPrice)) {
                        this.updateUrl = true
                        this.settings.minPrice = parseFloat(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'maxPrice':
                    if(this.validate(e.target.value, this.settings.minPrice, null)) {
                        this.updateUrl = true
                        this.settings.maxPrice = parseFloat(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'toSpend':
                    if(this.validate(e.target.value, 0, null)) {
                        this.settings.toSpend = parseFloat(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'search':
                    this.updateUrl = true
                    this.settings.search = e.target.value
                    e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    break

                case 'runDelay':
                    if(this.validate(e.target.value, 0.5, null)) {
                        this.settings.runDelay = parseFloat(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break
            }
        }
    },
    beforeMount() {
        this.csrfCookie = getCookie('csrf_cookie')
    },
    beforeDestroy() {
        //for(let awaitingItem of this.awaitingBuyItems) awaitingItem.DOMElement.remove()
        //this.awaitingBuyItems = []
        this.isRunning = false
    }
})