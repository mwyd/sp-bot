class SpBot {
    static allowedPaths = [
        '/en/',
        '/en'
    ];

    constructor() {
        this.runDelay = 4;
        this.submitKeyCode = 13;
        this.moneyAlreadySpent = 0;
        this.csrfCookie = getCookie('csrf_cookie');
        this.itemList = [];
        this.awaitingBuyItems = [];
        this.pendingBuyItems = [];
        this.isRunning = false;
        this.refreshMarketplace = false;
        this.notifiSound = new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3'));
        this.initDate = getFullDate(new Date());
        this.ui = {};
        this.lastDocumentLoc = 'https://shadowpay.com/en';
        this.presets = new Map();

        this.presets.set('default', {
            'name': 'default',
            'hotDeal': 70,
            'deal': 50,
            'dealMargin': 0,
            'minPriceItem': 1.00,
            'moneyToSpend': 10.00,
            'searchItem': '',
            'priceTo': 12958.58
        });
        this.currentPreset = this.presets.get('default');

        this.apiUrls = {
            getItems: 'https://api.shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12558.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
            buyItem: 'https://api.shadowpay.com/api/market/buy_item',
            getBuyHistory: 'https://api.shadowpay.com/en/profile/get_bought_history'
        }

        this.initUi();
    }

    async initUi() {
        //load data
        const botHTML = await loadFile('/html/bot.html');
        const presets = await loadFile('/user_data/presets.json', true);

        //create bot header
        this.ui.botHeader = document.createElement('div');
        this.ui.botHeader.setAttribute('class', 'sp-bot-header');
        this.ui.botHeader.innerHTML = botHTML;

        document.querySelector('.justify-content-center.marketplace-header').prepend(this.ui.botHeader);

        //set up bot ui
        this.ui.marketplaceSearch = document.querySelector('div.marketplace-inventory-search').childNodes[0];
        this.ui.toggleVisible = document.querySelector(".sp-bot-header__wrapper");
        this.ui.autoRefreshItems = document.querySelector('#auto-items-refresh');
        this.ui.startStopBtn = document.querySelector("#sp-bot-start-button");
        this.ui.hotDealIn = document.querySelector("#hotDealIn");
        this.ui.dealIn = document.querySelector("#dealIn");
        this.ui.dealMarginIn = document.querySelector("#dealMarginIn");
        this.ui.minPriceItemIn = document.querySelector("#minPriceItemIn");
        this.ui.moneyToSpendIn = document.querySelector("#moneyToSpendIn");
        this.ui.refreshTimeIn = document.querySelector('#refreshTimeIn');
        this.ui.processedListAwaiting = document.querySelector('#processed-list__awaiting');
        this.ui.processedListActive = document.querySelector("#processed-list__active");
        this.ui.processedListFinished = document.querySelector("#processed-list__finished");
        this.ui.moneySpentContainer = document.querySelector('#money-spent');
        this.ui.marketplaceRefresher = document.querySelector('a.refresh, a.marketplace-clear');
        this.ui.presetsSelect = document.querySelector('#presets-select');
        this.ui.errorDot = document.querySelector('#sp-bot-error-dot');

        this.setupFilterInputs();

        this.ui.marketplaceSearch.style.borderRadius = "5px";
        this.ui.marketplaceSearch.classList.add('input__value-ok');

        //search btn events
        this.ui.marketplaceSearch.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.searchItem));
        this.ui.marketplaceSearch.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                this.currentPreset.searchItem = e.target.value;
                this.updateSearchItemParm();
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //error dot
        this.ui.errorDot.addEventListener('click', e => {
            if(e.target.getAttribute('class') == 'button__red') e.target.setAttribute('class', 'button__green');
        });

        //startstop btn events
        this.ui.startStopBtn.addEventListener('click', (e) => {
            if(this.isRunning) {
                this.isRunning = false;
                this.ui.startStopBtn.setAttribute('class', 'button__green');
                e.target.innerHTML = "START";
                for(let pendingBuyItem of this.pendingBuyItems) pendingBuyItem.current_run = false;
            }
            else {
                this.isRunning = true;
                this.ui.startStopBtn.setAttribute('class', 'button__red');
                e.target.innerHTML = "STOP";
                this.moneyAlreadySpent = 0;
            }
        });

        //togglevisible btn events
        this.ui.toggleVisible.addEventListener("click", () => {
            let spBotContent = document.querySelector("#sp-bot-content");
            if(spBotContent.style.display == "flex" || spBotContent.style.display == "") spBotContent.style.display = "none";
            else spBotContent.style.display = "flex";
        });

        //auto refresh items checkbox events
        this.ui.autoRefreshItems.addEventListener('click', (e) => {
            e.target.checked ? this.refreshMarketplace = true : this.refreshMarketplace = false;
        });

        //input filters events

        //hotdeal
        this.ui.hotDealIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.hotDeal));
        this.ui.hotDealIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.hotDeal));
        this.ui.hotDealIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, 100);
                this.currentPreset.hotDeal = parseInt(e.target.value);
                e.target.value = this.currentPreset.hotDeal;
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //deal
        this.ui.dealIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.deal));
        this.ui.dealIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.deal));
        this.ui.dealIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, 100);
                this.currentPreset.deal = parseInt(e.target.value);
                e.target.value  = this.currentPreset.deal;
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //deal margin
        this.ui.dealMarginIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.dealMargin));
        this.ui.dealMarginIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.dealMargin));
        this.ui.dealMarginIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, -(100 - this.currentPreset.deal), this.currentPreset.deal);
                this.currentPreset.dealMargin = parseInt(e.target.value);
                e.target.value  = this.currentPreset.dealMargin;
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //refresh time
        this.ui.refreshTimeIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.runDelay));
        this.ui.refreshTimeIn.addEventListener('input', e => this.inputOnInput(e, this.runDelay));
        this.ui.refreshTimeIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 1, 10);
                this.runDelay = parseInt(e.target.value);
                e.target.value = this.runDelay;
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //min price item
        this.ui.minPriceItemIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.minPriceItem.toFixed(2)));
        this.ui.minPriceItemIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.minPriceItem));
        this.ui.minPriceItemIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, null);
                if(e.target.value < this.currentPreset.moneyToSpend) {
                    this.currentPreset.minPriceItem = parseFloat(e.target.value);
                } 
                else {
                    this.currentPreset.minPriceItem = this.currentPreset.moneyToSpend;
                    e.target.value = this.currentPreset.moneyToSpend;
                }
                e.target.value = this.currentPreset.minPriceItem.toFixed(2);
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //money to spend
        this.ui.moneyToSpendIn.addEventListener('focusout', e => this.inputOnFocusOut(e, this.currentPreset.moneyToSpend.toFixed(2)));
        this.ui.moneyToSpendIn.addEventListener('input', e => this.inputOnInput(e, this.currentPreset.moneyToSpend));
        this.ui.moneyToSpendIn.addEventListener('keydown', (e) => {
            if(e.keyCode == this.submitKeyCode) {
                validateNumberInput(e.target, 0, null);
                if(e.target.value > this.currentPreset.minPriceItem) {
                    this.currentPreset.moneyToSpend = parseFloat(e.target.value);
                }
                else {
                    this.currentPreset.moneyToSpend = this.currentPreset.minPriceItem;
                    e.target.value = this.currentPreset.minPriceItem;
                }
                e.target.value = this.currentPreset.moneyToSpend.toFixed(2);
                e.target.classList.replace('input__value-not-ok', 'input__value-ok');
            }
        });

        //set up presets select
        this.ui.presetsSelect.innerHTML = `<option name="${this.currentPreset.name}">${this.currentPreset.name}</option>`;
        for(let preset of presets) {
            this.presets.set(preset.name, preset);
            this.ui.presetsSelect.innerHTML += `<option name="${preset.name}">${preset.name}</option>`;
        }
        this.ui.presetsSelect.addEventListener('change', e => {
            this.currentPreset = this.presets.get(e.target.value);

            this.updateSearchItemParm();
            this.setupFilterInputs();
            this.ui.marketplaceSearch.value = this.currentPreset.searchItem;
            this.ui.marketplaceSearch.dispatchEvent(new KeyboardEvent('input'));
            this.ui.marketplaceRefresher.click();
        });
    }

    inputOnFocusOut(e, botVar) {
        e.target.value = botVar;
        e.target.classList.replace('input__value-not-ok', 'input__value-ok');
    }

    inputOnInput(e, botVar) {
        botVar == e.target.value ? e.target.classList.replace('input__value-not-ok', 'input__value-ok') : e.target.classList.replace('input__value-ok', 'input__value-not-ok');
    }

    setupFilterInputs() {
        this.ui.hotDealIn.value = this.currentPreset.hotDeal;
        this.ui.dealIn.value = this.currentPreset.deal;
        this.ui.dealMarginIn.value = this.currentPreset.dealMargin;
        this.ui.minPriceItemIn.value = this.currentPreset.minPriceItem.toFixed(2);
        this.ui.moneyToSpendIn.value = this.currentPreset.moneyToSpend.toFixed(2);
        this.ui.refreshTimeIn.value = this.runDelay;

        let priceToFilter = document.querySelectorAll('.marketplace-range-value__input')[1];
        priceToFilter.value = this.currentPreset.priceTo.toFixed(2);
        priceToFilter.dispatchEvent(new Event('change'));
    }

    bLog(msg, data) {
        console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] ' + msg, data);
    }

    buildBoughtItemContainer(item) {
        let DOMElement = document.createElement('div');
        DOMElement.classList.add('processed-list-row', `item-state-${item.state}`);

        DOMElement.innerHTML = '' +
            `<div class="processed-list-col processed-list-item-name">` +
                `<a target="_blank" href="https://steamcommunity.com/market/listings/730/${item.steam_market_hash_name}">` +
                    `<img style="padding-right: 10px;" height="50px" src="https://community.cloudflare.steamstatic.com/economy/image/${item.item.icon_url}">` +
                `${item.steam_market_hash_name}</a>` +
            `</div>` +
            `<div class="processed-list-col processed-list-price">$ ${item.price} <sup>${item.discount_real !== undefined ? item.discount_real + '% |': ''} ${item.discount}%</sup></div>` +
            `<div class="processed-list-col processed-list-status">${item.state}</div>` +
            `<div class="processed-list-col processed-list-date">${getFullDate(new Date(item.time_finished), 2)}</div>` +
            `${item.state == 'active' ? '<div class="processed-list-timebar"></div>' : ''}`;

        return DOMElement;
    }

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
                        for(let i = 0; i < this.pendingBuyItems.length; i++) {
                            if(this.pendingBuyItems[i].status == 'error') {
                                this.pendingBuyItems.splice(i, 1);
                                i--;
                                continue;
                            }

                            let historyItem = data.items.find(item => item.id == this.pendingBuyItems[i].id);
                            if(historyItem === undefined) continue;

                            historyItem.discount_real = this.pendingBuyItems[i].discount_real;
                            historyItem.current_run = this.pendingBuyItems[i].current_run;
                            historyItem.discount = this.pendingBuyItems[i].discount;

                            switch(historyItem.state) {
                                case 'cancelled':
                                    this.pendingBuyItems[i].DOMElement.remove();
                                    this.pendingBuyItems.splice(i, 1);
                                    i--;

                                    if(historyItem.current_run) this.moneyAlreadySpent -= parseFloat(historyItem.price);
                                    this.ui.processedListFinished.prepend(this.buildBoughtItemContainer(historyItem));
                                    break;

                                case 'finished':
                                    this.pendingBuyItems[i].DOMElement.remove();
                                    this.pendingBuyItems.splice(i, 1);
                                    i--;

                                    this.ui.processedListFinished.prepend(this.buildBoughtItemContainer(historyItem));
                                    if(this.pendingBuyItems.length == 0 && Math.abs(this.moneyAlreadySpent - this.currentPreset.moneyToSpend) < this.currentPreset.minPriceItem) this.ui.startStopBtn.click();
                                    break;

                                case 'active':
                                    if(this.pendingBuyItems[i].DOMElement !== undefined) continue;
                                    this.pendingBuyItems[i].DOMElement = this.buildBoughtItemContainer(historyItem);
                                    this.ui.processedListActive.prepend(this.pendingBuyItems[i].DOMElement);
                                    break;
                                }
                        }
                        break;
                }
            })
            .catch(err => {
                this.ui.errorDot.setAttribute('class', 'button__red');
                this.bLog('\n', new Error(err))
            });
        });
    }

    buildAwaitingItemContainer(item) {
        let DOMElement = document.createElement('div');
        DOMElement.classList.add('processed-list-row', `item-state-${item.state}`);

        DOMElement.innerHTML = '' +
            `<div class="processed-list-col processed-list-item-name">` +
                `<a target="_blank" href="https://steamcommunity.com/market/listings/730/${item.steam_market_hash_name}">` +
                    `<img style="padding-right: 10px;" height="50px" src="https://community.cloudflare.steamstatic.com/economy/image/${item.steam_icon_url_large}">` +
                `${item.steam_market_hash_name}</a>` +
            `</div>` +
            `<div class="processed-list-col processed-list-price">$ ${item.price_market} <sup>${item.discount_real !== undefined ? item.discount_real + '% |': ''} ${item.discount}%</sup></div>` +
            `<div class="processed-list-col processed-list-status">${item.state}</div>` +
            `<div class="processed-list-col processed-list-date"><button class="sp-bot-buy-item-button button__green">Buy now</button></div>`;

        return DOMElement;
    }

    addAwaitingItem(item) {
        if(this.awaitingBuyItems.findIndex(aItem => aItem.id == item.id) != -1) return;

        item.DOMElement = this.buildAwaitingItemContainer(item);
        item.DOMElement.querySelector('.sp-bot-buy-item-button').addEventListener('click', () => this.proceedBuy(item));

        this.ui.processedListAwaiting.prepend(item.DOMElement);
        this.awaitingBuyItems.push(item);
    }

    updateAwaitingItems() {        
        for(let i = 0; i < this.awaitingBuyItems.length; i++) {
            let item = this.itemList.find(item => item.id == this.awaitingBuyItems[i].id);
            
            if(item === undefined) {
                this.awaitingBuyItems[i].DOMElement.remove();
                this.awaitingBuyItems.splice(i, 1);
                i--;

                continue;
            }

            if(item.price_market != this.awaitingBuyItems[i].price_market ) {
                this.awaitingBuyItems[i].price = item.price;
                this.awaitingBuyItems[i].price_market = item.price_market;
                this.awaitingBuyItems[i].discount = item.discount;
                this.awaitingBuyItems[i].discount_real = getDiffAsPercentage(item.price_market, this.awaitingBuyItems[i].sp_bot_steam_price);
                this.awaitingBuyItems[i].DOMElement.querySelector('.processed-list-price').innerHTML = `$ ${this.awaitingBuyItems[i].price_market} <sup>${this.awaitingBuyItems[i].discount_real !== undefined ? this.awaitingBuyItems[i].discount_real + '% |': ''} ${this.awaitingBuyItems[i].discount}%</sup>`;
            }
        }
    }

    updateSearchItemParm() {
        let giURL = new URL(this.apiUrls.getItems);
        giURL.searchParams.set('search', this.currentPreset.searchItem);
        this.apiUrls.getItems = giURL.toString();
    }

    updateGetItemsUrl() {
        let dlhURL = new URL(document.location.href);
    
        if(SpBot.allowedPaths.includes(dlhURL.pathname)) {
            if(document.location.href != this.lastDocumentLoc) {
                this.lastDocumentLoc = document.location.href;
                let giURL = new URL(this.apiUrls.getItems);
        
                dlhURL.searchParams.forEach((val, key) => giURL.searchParams.set(key, val));
                this.apiUrls.getItems = giURL.toString();
            }
    
            if(this.refreshMarketplace) this.ui.marketplaceRefresher.click();
        }
    }

    proceedBuy(item, rePurchase = false) {
        if(rePurchase == false && this.pendingBuyItems.findIndex(pendingItem => pendingItem.itemId == item.id) != -1) return;
        if(rePurchase == true || parseFloat(item.price_market) + this.moneyAlreadySpent <= this.currentPreset.moneyToSpend) {
            this.moneyAlreadySpent += parseFloat(item.price_market);

            const pendingBuyItem = {
                id: undefined,
                itemId: item.id,
                discount: item.discount,
                discount_real: item.discount_real,
                current_run: true,
                DOMElement: undefined,
                status: 'pending'
            }
            this.pendingBuyItems.push(pendingBuyItem);

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
                                this.csrfCookie = data.token;
                                this.proceedBuy(item, true);
                                break;
                        }

                        pendingBuyItem.status = 'error';
                        this.moneyAlreadySpent -= parseFloat(item.price_market);
                        break;
                        
                    case "success":
                        pendingBuyItem.id = data.id;
                        pendingBuyItem.status = 'success';
                        
                        chrome.runtime.sendMessage({action: 'buy_item', params: {}});
                        this.notifiSound.play();
                        break;
                }
                this.bLog('Buy info', data);
            })
            .catch(err => {
                pendingBuyItem.status = 'error';
                this.moneyAlreadySpent -= parseFloat(item.price_market);

                this.ui.errorDot.setAttribute('class', 'button__red');
                this.bLog('\n', new Error(err))
            });
        }
    }

    async run() {
        while(true) {
            if(this.isRunning) {
                this.updateGetItemsUrl();
                this.itemList = [];
                if(Math.abs(this.moneyAlreadySpent - this.currentPreset.moneyToSpend) >= this.currentPreset.minPriceItem) {
                    try {    
                        const response = await fetch(this.apiUrls.getItems, {credentials: 'include'});
                        let data = await response.json();

                        if(data.status == "success") {
                            this.itemList = Array.from(data.items);
                
                            this.itemList = this.itemList.filter(item => !item.is_my_item);
                            this.itemList = this.itemList.filter(item => {
                                return (item.discount >= this.currentPreset.deal && item.price_market >= this.currentPreset.minPriceItem) || item.discount >= this.currentPreset.hotDeal;
                            });
                
                            this.itemList.sort((itemC, itemN) => { 
                                let itemCPriceF = parseFloat(itemC.price_market);
                                if(itemCPriceF < itemN.price_market) return 1;
                                if(itemCPriceF > itemN.price_market) return -1;   
                                return 0;
                            });
                
                            for(let item of this.itemList) {
                                chrome.runtime.sendMessage({action: 'get_price', params: {hash_name: item.steam_market_hash_name}}, res => {
                                    const {data} = res;
                                    if(data.success) {
                                        item.sp_bot_steam_price = data.price_info.sell_price / 100;
                                        item.discount_real = getDiffAsPercentage(item.price_market, item.sp_bot_steam_price);
                                        if(item.discount_real >= this.currentPreset.deal - (this.currentPreset.dealMargin) && data.price_info.volume > 1) this.proceedBuy(item);
                                        else this.addAwaitingItem(item);
                                    }
                                    else this.addAwaitingItem(item);
                                });
                            }

                            if(this.itemList.length > 0) this.bLog('Filtered items', this.itemList);
                        }
                    }
                    catch(err) {
                        this.ui.errorDot.setAttribute('class', 'button__red');
                        this.bLog('\n', new Error(err));
                    }
                }
                //this.bLog('', this)
                if(this.pendingBuyItems.length > 0) this.updateBuyHistory();
                if(this.awaitingBuyItems.length > 0 ) this.updateAwaitingItems();
                this.ui.moneySpentContainer.innerHTML = `$ ${this.moneyAlreadySpent.toFixed(2)} / ${this.currentPreset.moneyToSpend.toFixed(2)}`;
            }
            await new Promise(r => setTimeout(r, this.runDelay * 1000));
        }
    }
}

function initBot() {
    if(document.readyState == 'complete') {
        let dlhURL = new URL(document.location.href);
        if(SpBot.allowedPaths.includes(dlhURL.pathname)) {
            const spBot = new SpBot();
            spBot.run();
        }
    }
    else setTimeout(initBot, 1000);
}

initBot();
