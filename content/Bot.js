Vue.component('bot', {
    props: ['index'],
    data() {
        return {
            isRunning: false,
            runDelay: 4.0,
            hotDeal: 70,
            deal: 50,
            dealMargin: 0,
            minPrice: 1.00,
            maxPrice: 10.00,
            toSpend: 10.00,
            search: '',
            moneySpent: 0,
            csrfCookie: '',
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
                active: [],
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
                            :value="hotDeal" 
                            v-on:focusout="inFocusOut($event, 'hotDeal')" 
                            v-on:input="inInput($event, 'hotDeal')" 
                            v-on:keydown.enter="inEnter($event, 'hotDeal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item min price</span>
                            <input 
                            :value="minPrice" 
                            v-on:focusout="inFocusOut($event, 'minPrice')" 
                            v-on:input="inInput($event, 'minPrice')" 
                            v-on:keydown.enter="inEnter($event, 'minPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal margin</span>
                            <input 
                            :value="dealMargin" 
                            v-on:focusout="inFocusOut($event, 'dealMargin')" 
                            v-on:input="inInput($event, 'dealMargin')" 
                            v-on:keydown.enter="inEnter($event, 'dealMargin')" 
                            class="spb-bs__input input--val-ok" type="number" min="-100" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Search</span>
                            <input 
                            :value="search" 
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
                            :value="deal" 
                            v-on:focusout="inFocusOut($event, 'deal')" 
                            v-on:input="inInput($event, 'deal')" 
                            v-on:keydown.enter="inEnter($event, 'deal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>  
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item max price</span>
                            <input 
                            :value="maxPrice" 
                            v-on:focusout="inFocusOut($event, 'maxPrice')" 
                            v-on:input="inInput($event, 'maxPrice')" 
                            v-on:keydown.enter="inEnter($event, 'maxPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Money to spend</span>
                            <input 
                            :value="toSpend" 
                            v-on:focusout="inFocusOut($event, 'toSpend')" 
                            v-on:input="inInput($event, 'toSpend')" 
                            v-on:keydown.enter="inEnter($event, 'toSpend')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Refresh time</span>
                            <input 
                            :value="runDelay" 
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
                this.isRunning = false;
                this.$emit('statusupdate', 'idle');
            }
            else {
                this.isRunning = true;
                this.$emit('statusupdate', 'running');
            }
        },
        clear() {
            for(let pendingItem of this.items.active) pendingItem._current_run = false;
            this.items.toConfirm = [];
            this.$store.commit('updateItems', {type: 'toConfirm', spb_index: this.index, items: this.items.toConfirm});
            this.$store.commit('updateItems', {type: 'active', spb_index: this.index, items: []});
            this.moneySpent = 0;
        },
        updateGetItemsUrl() {
            if(this.updateUrl) {
                let getItemsURL = new URL(this.apiUrls.getItems);

                getItemsURL.searchParams.set('price_from', this.minPrice);
                getItemsURL.searchParams.set('price_to', this.maxPrice);
                getItemsURL.searchParams.set('search', this.search);

                this.apiUrls.getItems = getItemsURL.toString();
                this.updateUrl = false;
            }
        },
        addToConfirm(item) {
            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) != -1) return;
            
            item._onclick = () => {this.buyItem(item)};
            this.items.toConfirm.push(item);
            this.$store.commit('updateItems', {type: 'toConfirm', spb_index: this.index, items: this.items.toConfirm});
        },
        updateToConfirm() {
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
                    this.items.toConfirm[i]._real_discount = getDiffAsPercentage(item.price_market, this.items.toConfirm[i]._steam_price);
                    updated++;
                }
            }
            
            if(updated > 0) this.$store.commit('updateItems', {type: 'toConfirm', spb_index: this.index, items: this.items.toConfirm});
        },
        buyItem(item, rePurchase = false) {
            if(rePurchase == false && this.items.active.findIndex(_item => _item.id == item.id) != -1) return;
            if(rePurchase == true || parseFloat(item.price_market) + this.moneySpent <= this.toSpend) {
                this.moneySpent += parseFloat(item.price_market);
    
                item._status = 'pending';
                item._current_run = true;
                item._transaction_id = null;
                item._time_bought = getFullDate(new Date());

                this.items.active.push(item);
    
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
                                    this.buyItem(item, true);
                                    break;
                            }
    
                            item._status = 'error';
                            this.moneySpent -= parseFloat(item.price_market);
                            break
                            
                        case "success":
                            item._transaction_id = data.id;
                            item._status = 'success';
                            
                            chrome.runtime.sendMessage({action: 'buy_item', params: {}});
                            this.notifiSound.play();
                            break;
                    }

                    this.log('Buy info', data);
                })
                .catch(err => {
                    item._status = 'error';
                    this.moneySpent -= parseFloat(item.price_market);
                    this.log('\n', new Error(err))
                })
            }
        },
        updatePending() {
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
                            for(let i = this.items.active.length - 1; i >= 0 ; i--) {
                                let item = this.items.active[i];

                                if(item._status == 'error') {
                                    this.items.active.splice(i, 1);
                                    continue;
                                }
    
                                let historyItem = data.items.find(_item => _item.id == item._transaction_id)
                                if(historyItem === undefined) continue;

                                item.state = historyItem.state;
    
                                switch(item.state) {
                                    case 'cancelled':
                                        this.items.active.splice(i, 1);
                                        this.items.finished.push(item);
    
                                        if(item._current_run) this.moneySpent -= parseFloat(item.price_market);
                                        this.$store.commit('updateItems', {type: 'finished', spb_index: this.index, items: this.items.finished});
                                        break;
    
                                    case 'finished':
                                        this.items.active.splice(i, 1);
                                        this.items.finished.push(item);
    
                                        if(this.items.active.length == 0 && Math.abs(this.moneySpent - this.toSpend) < this.minPrice) this.toggleStart();
                                        this.$store.commit('updateItems', {type: 'finished', spb_index: this.index, items: this.items.finished});
                                        break;
    
                                    case 'active':
                                        this.$store.commit('updateItems', {type: 'active', spb_index: this.index, items: this.items.active});
                                        break;
                                    }
                            }
                            break;
                    }
                })
                .catch(err => {
                    this.log('\n', new Error(err))
                })
            });
        },
        async run() {
            this.toggleStart();

            while(this.isRunning) {
                this.updateGetItemsUrl();
                this.items.filtered = [];

                if(Math.abs(this.moneySpent - this.toSpend) >= this.minPrice) {
                    try {    
                        const response = await fetch(this.apiUrls.getItems, {credentials: 'include'});
                        let data = await response.json();

                        if(data.status == "success") {
                            this.items.filtered = Array.from(data.items);
                
                            this.items.filtered = this.items.filtered.filter(item => !item.is_my_item);
                            this.items.filtered = this.items.filtered.filter(item => {
                                return (item.discount >= this.deal && item.price_market >= this.minPrice) || item.discount >= this.hotDeal;
                            })
                
                            this.items.filtered.sort((itemC, itemN) => { 
                                let price = parseFloat(itemC.price_market);
                                if(price < itemN.price_market) return 1;
                                if(price > itemN.price_market) return -1;
                                return 0;
                            });

                            for(let item of this.items.filtered) {
                                chrome.runtime.sendMessage({
                                    action: 'get_price', 
                                    params: {
                                        hash_name: item.steam_market_hash_name, 
                                        apiKey: this.$store.state.auth.apiKey}}, 
                                    res => {
                                    const {stats, success} = res.data;
                                    item.discount = Math.round(item.discount);

                                    if(success) {
                                        item._app_sell_price = stats.approximate_sell_price;
                                        item._avg_discount = stats.avg_discount;
                                        item._sold = stats.items_sold;
                                        item._last_sold = stats.last_sold;
                                        item._steam_price = stats.steam_price;
                                        item._steam_volume = stats.steam_volume;
                                        item._real_discount = getDiffAsPercentage(item.price_market, item._steam_price);

                                        if(item._real_discount >= this.deal + (this.dealMargin) && item._steam_volume > 1) this.buyItem(item);
                                        else this.addToConfirm(item);
                                    }
                                    else this.addToConfirm(item);
                                });
                            }
                        }
                    }
                    catch(err) {
                        this.log('\n', new Error(err));
                    }
                }

                if(this.items.active.length > 0) this.updatePending();
                if(this.items.toConfirm.length > 0 ) this.updateToConfirm();
                //this.ui.moneySpentContainer.innerHTML = `$ ${this.moneySpent.toFixed(2)} / ${this.currentPreset.moneyToSpend.toFixed(2)}`;
                    
                await new Promise(r => setTimeout(r, 1000 * this.runDelay));
            }

            this.clear();
        },
        log(msg, data) {
            console.log('[' + new Date().toLocaleTimeString() + '] [SP-BOT] ' + msg, data);
        },
        validate(target, min, max) {
            if(max == null) return target >= min;
            if(min == null) return target <= max;
            
            return target <= max && target >= min;
        },
        getOptionByName(name) {
            switch(name) {
                case 'hotDeal':
                    return this.hotDeal;

                case 'deal':
                    return this.deal;

                case 'dealMargin':
                    return this.dealMargin;

                case 'minPrice':
                    return this.minPrice;

                case 'maxPrice':
                    return this.maxPrice;

                case 'toSpend':
                    return this.toSpend;

                case 'search':
                    return this.search;

                case 'runDelay':
                    return this.runDelay;

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
                        this.hotDeal = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break

                case 'deal':
                    if(this.validate(e.target.value, 0, 100)) {
                        this.deal = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'dealMargin':
                    if(this.validate(e.target.value, -this.deal, (100 - this.deal))) {
                        this.dealMargin = parseInt(e.target.value);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'minPrice':
                    if(this.validate(e.target.value, 0, this.maxPrice)) {
                        this.updateUrl = true;
                        this.minPrice = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'maxPrice':
                    if(this.validate(e.target.value, this.minPrice, null)) {
                        this.updateUrl = true;
                        this.maxPrice = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'toSpend':
                    if(this.validate(e.target.value, 0, null)) {
                        this.toSpend = parseFloat(e.target.value).toFixed(2);
                        e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    }
                    else this.inFocusOut(e, name);
                    break;

                case 'search':
                    this.updateUrl = true;
                    this.search = e.target.value;
                    e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    break;

                case 'runDelay':
                    if(this.validate(e.target.value, 0.5, null)) {
                        this.runDelay = parseFloat(e.target.value).toFixed(1);
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