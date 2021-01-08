Vue.component('bot', {
    props: ['index'],
    data() {
        return {
            isRunning: false,
            hotDeal: 70,
            deal: 50,
            dealMargin: 0,
            minPrice: '1.00',
            maxPrice: '10.00',
            toSpend: '10.00',
            runDelay: '4.0',
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
                            @focusout="inFocusOut($event, 'hotDeal')" 
                            @input="inInput($event, 'hotDeal')" 
                            @keydown.enter="inEnter($event, 'hotDeal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item min price</span>
                            <input 
                            :value="minPrice" 
                            @focusout="inFocusOut($event, 'minPrice')" 
                            @input="inInput($event, 'minPrice')" 
                            @keydown.enter="inEnter($event, 'minPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal margin</span>
                            <input 
                            :value="dealMargin" 
                            @focusout="inFocusOut($event, 'dealMargin')" 
                            @input="inInput($event, 'dealMargin')" 
                            @keydown.enter="inEnter($event, 'dealMargin')" 
                            class="spb-bs__input input--val-ok" type="number" min="-100" max="100">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Search</span>
                            <input 
                            :value="search" 
                            @focusout="inFocusOut($event, 'search')" 
                            @input="inInput($event, 'search')" 
                            @keydown.enter="inEnter($event, 'search')" 
                            class="spb-bs__input input--val-ok" type="text" min="0" step="0.01">
                    </div>  
                </div>
                <div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">% Deal</span>
                            <input 
                            :value="deal" 
                            @focusout="inFocusOut($event, 'deal')" 
                            @input="inInput($event, 'deal')" 
                            @keydown.enter="inEnter($event, 'deal')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                    </div>  
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Item max price</span>
                            <input 
                            :value="maxPrice" 
                            @focusout="inFocusOut($event, 'maxPrice')" 
                            @input="inInput($event, 'maxPrice')" 
                            @keydown.enter="inEnter($event, 'maxPrice')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">$ Money to spend</span>
                            <input 
                            :value="toSpend" 
                            @focusout="inFocusOut($event, 'toSpend')" 
                            @input="inInput($event, 'toSpend')" 
                            @keydown.enter="inEnter($event, 'toSpend')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
                    </div>
                    <div class="spb-bs__option">
                        <span class="spb-bs__desc">Refresh time</span>
                            <input 
                            :value="runDelay" 
                            @input="inInput($event, 'runDelay')" 
                            @focusout="inFocusOut($event, 'runDelay')" 
                            @keydown.enter="inEnter($event, 'runDelay')" 
                            class="spb-bs__input input--val-ok" type="number" min="0" step="1">
                    </div>
                </div>
            </div>
            <button 
                @click="run" 
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
                    this.items.toConfirm[i].discount = Math.round(item.discount);
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
                            });
                
                            this.items.filtered.sort((a, b) => b.price_market - a.price_market);

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
                                        item._app_income = ((0.87 * stats.steam_price) - item.price_market).toFixed(2);
                                        item._app_income_percentage = getDiffAsPercentage(item.price_market - item._app_income, item.price_market);
                                        item._real_discount = getDiffAsPercentage(item.price_market, item._steam_price);

                                        if(item._real_discount >= this.deal + (this.dealMargin) && item._steam_volume > 10) this.buyItem(item);
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
            if(parseFloat(target.value) < min && min !== null) target.value = min;
            else if(parseFloat(target.value) > max && max !== null) target.value = max;

            target.classList.replace('input--val-wrong', 'input--val-ok');
            return target.value;
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
                    this.hotDeal = parseInt(this.validate(e.target, 0, 100));
                    break;

                case 'deal':
                    this.deal = parseInt(this.validate(e.target, 0, 100));
                    break;

                case 'dealMargin':
                    this.dealMargin = parseInt(this.validate(e.target, -this.deal, (100 - this.deal)));
                    break;

                case 'minPrice':
                    this.updateUrl = true;
                    this.minPrice = parseFloat(this.validate(e.target, 0, this.maxPrice)).toFixed(2);
                    break;

                case 'maxPrice':
                    this.updateUrl = true;
                    this.maxPrice = parseFloat(this.validate(e.target, this.minPrice, null)).toFixed(2);
                    break;

                case 'toSpend':
                    this.toSpend = parseFloat(this.validate(e.target, this.maxPrice, null)).toFixed(2);
                    break;

                case 'search':
                    this.updateUrl = true;
                    this.search = e.target.value;
                    e.target.classList.replace('input--val-wrong', 'input--val-ok');
                    break;

                case 'runDelay':
                    this.runDelay = parseFloat(this.validate(e.target, 0.5, null)).toFixed(1);
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