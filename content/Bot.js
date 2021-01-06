Vue.component('bot', {
    props: ['index'],
    data: function() {
        return {
            settings: {
                runDelay: 4.0,
                hotDeal: 70,
                deal: 50,
                dealMargin: 0,
                minPrice: 1.00,
                maxPrice: 100.00,
                toSpend: 10.00,
                search: ''
            },
            moneyAlreadySpent: 0,
            csrfCookie: '',
            isRunning: false,
            updateUrl: true,
            notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
            initDate: getFullDate(new Date()),
            apiUrls: {
                getItems: 'https://api.shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12558.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
                buyItem: 'https://api.shadowpay.com/api/market/buy_item',
                getBuyHistory: 'https://api.shadowpay.com/en/profile/get_bought_history'
            },
            items: {
                filtered: [],
                toConfirm: [],
                pending: [],
                finished: []
            }
        }
    },
    template: `
        <div class="spb-bot-settings flex">
            <h3 class="spb-header-3">Options - Bot {{ index }}</h3>
            <div class="spb-flex">
                <div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Hot deal</span>
                            <input 
                            :value="settings.hotDeal" 
                            v-on:focusout="inFocusOut($event, 'hotDeal')" 
                            v-on:input="inInput($event, 'hotDeal')" 
                            v-on:keydown.enter="inEnter($event, 'hotDeal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item min price</span>
                            <input 
                            :value="settings.minPrice" 
                            v-on:focusout="inFocusOut($event, 'minPrice')" 
                            v-on:input="inInput($event, 'minPrice')" 
                            v-on:keydown.enter="inEnter($event, 'minPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal margin</span>
                            <input 
                            :value="settings.dealMargin" 
                            v-on:focusout="inFocusOut($event, 'dealMargin')" 
                            v-on:input="inInput($event, 'dealMargin')" 
                            v-on:keydown.enter="inEnter($event, 'dealMargin')" 
                            class="spb-bs__input input--val-ok" type="number" min="-100" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Search</span>
                            <input 
                            :value="settings.search" 
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
                            :value="settings.deal" 
                            v-on:focusout="inFocusOut($event, 'deal')" 
                            v-on:input="inInput($event, 'deal')" 
                            v-on:keydown.enter="inEnter($event, 'deal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>  
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item max price</span>
                            <input 
                            :value="settings.maxPrice" 
                            v-on:focusout="inFocusOut($event, 'maxPrice')" 
                            v-on:input="inInput($event, 'maxPrice')" 
                            v-on:keydown.enter="inEnter($event, 'maxPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Money to spend</span>
                            <input 
                            :value="settings.toSpend" 
                            v-on:focusout="inFocusOut($event, 'toSpend')" 
                            v-on:input="inInput($event, 'toSpend')" 
                            v-on:keydown.enter="inEnter($event, 'toSpend')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Refresh time</span>
                            <input 
                            :value="settings.runDelay" 
                            v-on:input="inInput($event, 'runDelay')" 
                            v-on:focusout="inFocusOut($event, 'runDelay')" 
                            v-on:keydown.enter="inEnter($event, 'runDelay')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="1">
                    </div>
                </div>
            </div>
            <button 
                v-on:click="run" 
                :class="'spb-bs__start-button ' + (isRunning ? 'spb-button--red' : 'spb-button--green')">
                {{ isRunning ? 'STOP' : 'START' }}
            </button>
        </div>
    `,
    methods: {
        toggleStart() {
            if(this.isRunning) {
                for(let pendingItem of this.items.pending) pendingItem.current_run = false;
                this.items.toConfirm = [];
                this.isRunning = false;
                this.$emit('statusupdate', 'idle');
            }
            else {
                this.isRunning = true;
                this.moneyAlreadySpent = 0;
                this.$emit('statusupdate', 'running');
            }
        },
        updateGetItemsUrl() {
            if(this.updateUrl) {
                let getItemsURL = new URL(this.apiUrls.getItems);

                getItemsURL.searchParams.set('price_from', this.settings.minPrice);
                getItemsURL.searchParams.set('price_to', this.settings.maxPrice);
                getItemsURL.searchParams.set('search', this.settings.search);

                this.apiUrls.getItems = getItemsURL.toString();
                this.updateUrl = false;
            }
        },
        addAwaitingItem(item) {
            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) != -1) return;
    
            item.onclick = () => {this.proceedBuy(item)};
            this.items.toConfirm.push(item);
            this.$store.commit('updateItems', {type: 'toConfirm', spb_index: this.index, items: this.items.toConfirm});
        },
        updateAwaitingItems() {
            let updated = 0;        
            for(let i = this.items.toConfirm.length - 1; i >= 0; i--) {
                let item = this.items.filtered.find(_item => _item.id == this.items.toConfirm[i].id);
                
                if(item === undefined) {
                    this.items.toConfirm.splice(i, 1);
                    continue;
                }
    
                if(item.price_market != this.items.toConfirm[i].price_market ) {
                    this.items.toConfirm[i].price = item.price;
                    this.items.toConfirm[i].price_market = item.price_market;
                    this.items.toConfirm[i].discount = item.discount;
                    this.items.toConfirm[i].discount_real = getDiffAsPercentage(item.price_market, this.items.toConfirm[i].sp_bot_steam_price);
                    updated++;
                }
            }

            if(updated > 0) this.$store.commit('updateItems', {type: 'toConfirm', spb_index: this.index, items: this.items.toConfirm});
        },
        proceedBuy(item, rePurchase = false) {
            if(rePurchase == false && this.items.pending.findIndex(_item => _item.itemId == item.id) != -1) return;
            if(rePurchase == true || parseFloat(item.price_market) + this.moneyAlreadySpent <= this.settings.toSpend) {
                this.moneyAlreadySpent += parseFloat(item.price_market);
    
                const pendingItem = {
                    id: undefined,
                    itemId: item.id,
                    discount: item.discount,
                    discount_real: item.discount_real,
                    current_run: true,
                    status: 'pending'
                }

                this.items.pending.push(pendingItem);
    
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
    
                            pendingItem.status = 'error';
                            this.moneyAlreadySpent -= parseFloat(item.price_market);
                            break
                            
                        case "success":
                            pendingItem.id = data.id;
                            pendingItem.status = 'success';
                            
                            chrome.runtime.sendMessage({action: 'buy_item', params: {}});
                            this.notifiSound.play();
                            break;
                    }
                    //this.bLog('Buy info', data)
                    console.log(data)
                })
                .catch(err => {
                    pendingItem.status = 'error';
                    this.moneyAlreadySpent -= parseFloat(item.price_market);
    
                    /*this.ui.errorDot.setAttribute('class', 'button__red');*/
                    //this.bLog('\n', new Error(err))
                    console.log(err);
                })
            }
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
                            for(let i = this.items.pending.length - 1; i >= 0 ; i--) {
                                if(this.items.pending[i].status == 'error') {
                                    this.items.pending.splice(i, 1);
                                    continue;
                                }
    
                                let historyItem = data.items.find(_item => _item.id == this.items.pending[i].id)
                                if(historyItem === undefined) continue;
    
                                historyItem.discount_real = this.items.pending[i].discount_real;
                                historyItem.current_run = this.items.pending[i].current_run;
                                historyItem.discount = this.items.pending[i].discount;
    
                                switch(historyItem.state) {
                                    case 'cancelled':
                                        this.items.pending.splice(i, 1);
                                        this.finished.push(historyItem);
    
                                        if(historyItem.current_run) this.moneyAlreadySpent -= parseFloat(historyItem.price);
                                        this.$store.commit('updateItems', {type: 'finished', spb_index: this.index, items: this.finished});
                                        break;
    
                                    case 'finished':
                                        this.items.pending.splice(i, 1);
                                        this.finished.push(historyItem);
    
                                        if(this.items.pending.length == 0 && Math.abs(this.moneyAlreadySpent - this.settings.toSpend) < this.settings.minPrice) this.toggleStart();
                                        this.$store.commit('updateItems', {type: 'finished', spb_index: this.index, items: this.finished});
                                        break;
    
                                    case 'active':
                                        this.$store.commit('updateItems', {type: 'active', spb_index: this.index, items: [historyItem]});
                                        break;
                                    }
                            }
                            break;
                    }
                })
                .catch(err => {
                    //this.ui.errorDot.setAttribute('class', 'button__red');
                    //this.bLog('\n', new Error(err))
                    console.log(err);
                })
            })
        },
        async run() {
            this.toggleStart();
            while(this.isRunning) {
                this.updateGetItemsUrl();
                this.items.filtered = [];
                if(Math.abs(this.moneyAlreadySpent - this.settings.toSpend) >= this.settings.minPrice) {
                    try {    
                        const response = await fetch(this.apiUrls.getItems, {credentials: 'include'});
                        let data = await response.json();

                        if(data.status == "success") {
                            this.items.filtered = Array.from(data.items);
                
                            this.items.filtered = this.items.filtered.filter(item => !item.is_my_item);
                            this.items.filtered = this.items.filtered.filter(item => {
                                return (item.discount >= this.settings.deal && item.price_market >= this.settings.minPrice) || item.discount >= this.settings.hotDeal;
                            })
                
                            this.items.filtered.sort((itemC, itemN) => { 
                                let itemCPriceF = parseFloat(itemC.price_market);
                                if(itemCPriceF < itemN.price_market) return 1;
                                if(itemCPriceF > itemN.price_market) return -1;
                                return 0;
                            })

                            for(let item of this.items.filtered) {
                                chrome.runtime.sendMessage({action: 'get_price', params: {hash_name: item.steam_market_hash_name}}, res => {
                                    const {data} = res;
                                    item.discount = Math.round(item.discount);
                                    if(data.success) {
                                        item.sp_bot_steam_price = data.data.steam.price;
                                        item.discount_real = getDiffAsPercentage(item.price_market, item.sp_bot_steam_price);
                                        if(item.discount_real >= this.settings.deal + (this.settings.dealMargin) && data.data.steam.volume > 1) this.proceedBuy(item);
                                        else this.addAwaitingItem(item);
                                    }
                                    else this.addAwaitingItem(item);
                                });
                            }

                            if(this.items.filtered.length > 0) console.log(this.items.filtered);
                        }
                    }
                    catch(err) {
                        /*this.ui.errorDot.setAttribute('class', 'button__red');
                        this.bLog('\n', new Error(err));*/
                        console.log(err);
                    }
                }
                //this.bLog('', this)
                if(this.items.pending.length > 0) this.updateBuyHistory();
                if(this.items.toConfirm.length > 0 ) this.updateAwaitingItems();
                //this.ui.moneySpentContainer.innerHTML = `$ ${this.moneyAlreadySpent.toFixed(2)} / ${this.currentPreset.moneyToSpend.toFixed(2)}`;
                    
                await new Promise(r => setTimeout(r, 1000 * this.settings.runDelay));
            }
        },
        validate(target, min, max) {
            if(max == null) return target >= min;
            if(min == null) return target <= max;
            
            return target <= max && target >= min;
        },
        getOptionByName(name) {
            switch(name) {
                case 'hotDeal':
                    return this.settings.hotDeal;

                case 'deal':
                    return this.settings.deal;

                case 'dealMargin':
                    return this.settings.dealMargin;

                case 'minPrice':
                    return this.settings.minPrice;

                case 'maxPrice':
                    return this.settings.maxPrice;

                case 'toSpend':
                    return this.settings.toSpend;

                case 'search':
                    return this.settings.search;

                case 'runDelay':
                    return this.settings.runDelay;

                default:
                    return null;
            }
        },
        inFocusOut(e, name) {
            let option = this.getOptionByName(name);
            if(option == null) return;

            e.target.value = option;
            e.target.classList.replace('input--val-wrong', 'input--val-ok'); 
        },
        inInput(e, name) {
            let option = this.getOptionByName(name);
            if(option == null) return;

            option == e.target.value ? e.target.classList.replace('input--val-wrong', 'input--val-ok') : e.target.classList.replace('input--val-ok', 'input--val-wrong');
        },
        inEnter(e, name) {
            switch(name) {
                case 'hotDeal':
                    if(this.validate(e.target.value, 0, 100)) {
                        this.settings.hotDeal = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break

                case 'deal':
                    if(this.validate(e.target.value, 0, 100)) {
                        this.settings.deal = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'dealMargin':
                    if(this.validate(e.target.value, -this.settings.deal, (100 - this.settings.deal))) {
                        this.settings.dealMargin = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'minPrice':
                    if(this.validate(e.target.value, 0, this.settings.maxPrice)) {
                        this.updateUrl = true;
                        this.settings.minPrice = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'maxPrice':
                    if(this.validate(e.target.value, this.settings.minPrice, null)) {
                        this.updateUrl = true;
                        this.settings.maxPrice = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'toSpend':
                    if(this.validate(e.target.value, 0, null)) {
                        this.settings.toSpend = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'search':
                    this.updateUrl = true;
                    this.settings.search = e.target.value;
                    e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    break;

                case 'runDelay':
                    if(this.validate(e.target.value, 0.5, null)) {
                        this.settings.runDelay = parseFloat(e.target.value).toFixed(1);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;
            }
        }
    },
    beforeMount() {
        this.csrfCookie = getCookie('csrf_cookie');
    },
    beforeDestroy() {
        this.isRunning = false;
    }
});