Vue.component('bot', {
    props: ['index'],
    data() {
        return {
            isRunning: false,
            timeoutId: null,
            presetIndex: 0,
            preset: {},
            moneySpent: 0,
            updateUrl: true,
            initDate: dateTime(new Date()),
            lastPendingUpdate: Date.now(),
            pendingUpdateDelay: 10,
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
        <div class="spb-bot">
            <h3 class="spb-header-3">Options - Bot {{ index }}</h3>
            <div class="spb-bot__options spb-flex">
                <div>
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">% Deal</span>
                            <input 
                            :value="preset.deal" 
                            @focusout="inFocusOut($event, 'deal', 0)" 
                            @input="inInput($event, 'deal')" 
                            @keydown.enter="inEnter($event, 'deal')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>  
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">$ Item min price</span>
                            <input 
                            :value="preset.minPrice.toFixed(2)" 
                            @focusout="inFocusOut($event, 'minPrice', 2)" 
                            @input="inInput($event, 'minPrice')" 
                            @keydown.enter="inEnter($event, 'minPrice')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">Preset</span>
                            <select @change="updatePreset()" v-model="presetIndex" class="spb-input spb-input--val-ok">
                                <option v-for="(preset, index) in $store.getters.presets" :key="'preset-' + index" :value="index">
                                    {{preset.name}}
                                </option>
                            </select>
                    </div>  
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">Search</span>
                            <input 
                            :value="preset.search" 
                            @focusout="inFocusOut($event, 'search', 0)" 
                            @input="inInput($event, 'search')" 
                            @keydown.enter="inEnter($event, 'search')" 
                            class="spb-input spb-input--val-ok" type="text">
                    </div> 
                </div>
                <div>
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">% Deal margin</span>
                            <input 
                            :value="preset.dealMargin" 
                            @focusout="inFocusOut($event, 'dealMargin', 0)" 
                            @input="inInput($event, 'dealMargin')" 
                            @keydown.enter="inEnter($event, 'dealMargin')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>  
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">$ Item max price</span>
                            <input 
                            :value="preset.maxPrice.toFixed(2)" 
                            @focusout="inFocusOut($event, 'maxPrice', 2)" 
                            @input="inInput($event, 'maxPrice')" 
                            @keydown.enter="inEnter($event, 'maxPrice')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">$ Money to spend</span>
                            <input 
                            :value="preset.toSpend.toFixed(2)" 
                            @focusout="inFocusOut($event, 'toSpend', 2)" 
                            @input="inInput($event, 'toSpend')" 
                            @keydown.enter="inEnter($event, 'toSpend')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>
                    <div class="spb-bot__option">
                        <span class="spb-bot__option-desc">Refresh time</span>
                            <input 
                            :value="preset.runDelay.toFixed(1)" 
                            @input="inInput($event, 'runDelay')" 
                            @focusout="inFocusOut($event, 'runDelay', 1)" 
                            @keydown.enter="inEnter($event, 'runDelay')" 
                            class="spb-input spb-input--val-ok" type="number">
                    </div>
                </div>
            </div>
            <button 
                @click="toggleStart" 
                :class="'spb-button ' + (isRunning ? 'spb-button--red' : 'spb-button--green')">
                {{ isRunning ? 'STOP' : 'START' }}
            </button>
        </div>
    `,
    methods: {
        initTimeout() {
            this.timeoutId = setTimeout(() => {
                this.run();
            }, 1000 * this.preset.runDelay);
        },
        toggleStart() {
            if(this.isRunning) {
                this.isRunning = false;
                clearTimeout(this.timeoutId);
                this.clear();
                this.$emit('statusupdate', 'idle');
            }
            else {
                this.isRunning = true;
                this.initTimeout();
                this.$emit('statusupdate', 'running');
            }
        },
        clear() {
            for(let pendingItem of this.items.pending) pendingItem._current_run = false;
            this.items.toConfirm = [];
            this.moneySpent = 0;
        },
        updateGetItemsUrl() {
            if(this.updateUrl) {
                let getItemsURL = new URL(this.apiUrls.getItems);

                getItemsURL.searchParams.set('price_from', this.preset.minPrice);
                getItemsURL.searchParams.set('price_to', this.preset.maxPrice);
                getItemsURL.searchParams.set('search', this.preset.search);

                this.apiUrls.getItems = getItemsURL.toString();
                this.updateUrl = false;
            }
        },
        updatePreset(index = null) {
            if(index) this.presetIndex = index;
            this.updateUrl = true;
            this.preset = {...this.$store.getters.presets[this.presetIndex]};
        },
        addToConfirm(item) {
            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) != -1) return;
            
            item._onclick = () => {this.buyItem(item)};
            this.items.toConfirm.push(item);
        },
        updateToConfirm() {       
            for(let i = this.items.toConfirm.length - 1; i >= 0; i--) {
                let tcItem = this.items.toConfirm[i];
                let item = this.items.filtered.find(_item => _item.id == tcItem.id);
                
                if(item === undefined) {
                    this.items.toConfirm.splice(i, 1);
                    continue;
                }
    
                if(item.price_market != tcItem.price_market ) {
                    this.items.toConfirm.splice(i, 1);
                    continue;
                }

                if(tcItem._updated && tcItem._real_discount >= this.preset.deal + (this.preset.dealMargin) && tcItem._steam_volume > 10) this.buyItem(tcItem);
            }
        },
        buyItem(item, repurchase = false) {
            if(!repurchase) {
                if(this.items.pending.findIndex(_item => _item.id == item.id) != -1 || parseFloat(item.price_market) + this.moneySpent > this.preset.toSpend) return;

                item._status = 'pending';
                item._current_run = true;
                item._transaction_id = null;
                item._time_bought = dateTime(new Date());

                this.items.pending.push(item);
                this.moneySpent += parseFloat(item.price_market);
            }
    
            fetch(this.apiUrls.buyItem, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${item.id}&price=${item.price_market}&csrf_token=${this.$store.getters.csrfCookie}`
            })
            .then(res => res.json())
            .then(data => {
                switch(data.status) {
                    case "error":
                        switch(data.error_message) {
                            case 'wrong_token':
                                this.$store.commit('setCsrfCookie', data.token);
                                this.buyItem(item, true);
                                break;

                            default:
                                this.moneySpent -= parseFloat(item.price_market);
                                item._status = 'error';
                                break;
                        }
                        break;
                        
                    case "success":
                        item._transaction_id = data.id;
                        item._status = 'success';
                        
                        chrome.runtime.sendMessage({action: 'buy_item', params: {}});
                        this.$store.getters.notifySound.play();
                        break;
                }

                spbLog('Buy info', {...data, _item: item});
            })
            .catch(err => {
                item._status = 'error';
                this.moneySpent -= parseFloat(item.price_market);
                spbLog('\n', new Error(err))
            });
        },
        updatePending() {
            if(this.items.pending.length == 0 || Date.now() - this.lastPendingUpdate < this.pendingUpdateDelay * 1000) return;
            chrome.runtime.sendMessage({action: 'get_bought_items_counter', params: {}}, res => {
                fetch(this.apiUrls.getBuyHistory, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `page=1&limit=${res.data}&sort_column=time_finished&sort_dir=desc&custom_id=&date_start=${dateTime(new Date(this.initDate), -2)}&date_end=&state=all`
                })
                .then(res => res.json())
                .then(data => {
                    this.lastPendingUpdate = Date.now();
                    switch(data.status) {
                        case 'success':
                            for(let i = this.items.pending.length - 1; i >= 0 ; i--) {
                                let item = this.items.pending[i];

                                if(item._status == 'error') {
                                    this.items.pending.splice(i, 1);
                                    continue;
                                }
    
                                let historyItem = data.items.find(_item => _item.id == item._transaction_id)
                                if(historyItem === undefined) continue;

                                item.state = historyItem.state;
    
                                switch(item.state) {
                                    case 'cancelled':
                                        this.items.pending.splice(i, 1);
                                        this.items.finished.push(item);
    
                                        if(item._current_run) this.moneySpent -= parseFloat(item.price_market);
                                        break;
    
                                    case 'finished':
                                        this.items.pending.splice(i, 1);
                                        this.items.finished.push(item);
    
                                        if(this.items.pending.length == 0 && Math.abs(this.moneySpent - this.preset.toSpend) < this.preset.minPrice) this.toggleStart();
                                        break;
                                    }
                            }
                            break;
                    }
                })
                .catch(err => {
                    spbLog('\n', new Error(err))
                })
            });
        },
        async run() {
            this.updateGetItemsUrl();
            this.items.filtered = [];

            if(Math.abs(this.moneySpent - this.preset.toSpend) >= this.preset.minPrice) {
                try {    
                    const response = await fetch(this.apiUrls.getItems, {credentials: 'include'});
                    let data = await response.json();

                    if(data.status == "success") {
                        this.items.filtered = Array.from(data.items);
            
                        this.items.filtered = this.items.filtered.filter(item => !item.is_my_item);
                        this.items.filtered = this.items.filtered.filter(item => {
                            return item.discount >= this.preset.deal && item.price_market >= this.preset.minPrice;
                        });
            
                        this.items.filtered.sort((a, b) => b.price_market - a.price_market);

                        for(let item of this.items.filtered) {
                            item._updated = false;
                            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) > -1) continue;

                            chrome.runtime.sendMessage({
                                action: 'steam_market', 
                                params: {
                                    hash_name: item.steam_market_hash_name, 
                                    apiKey: this.$store.getters.apiKey}
                                }, 
                                res => {
                                const {stats, success} = res.data;
                                item.discount = Math.round(item.discount);

                                if(success) {
                                    item._steam_price = stats.steam_price;
                                    item._steam_volume = stats.steam_volume;
                                    item._app_income = ((0.87 * stats.steam_price) - item.price_market).toFixed(2);
                                    item._app_income_percentage = percentageDifference(item.price_market - item._app_income, item.price_market);
                                    item._real_discount = percentageDifference(item.price_market, item._steam_price);
                                    item._updated = true;
                                }
                                this.addToConfirm(item);
                            });
                        }
                    }
                }
                catch(err) {
                    spbLog('\n', new Error(err));
                }
            }

            this.updatePending();
            this.updateToConfirm();
                    
            if(this.isRunning) this.initTimeout(); 
        },
        validate(target, min, max) {
            if(parseFloat(target.value) < min && min !== null) target.value = min;
            else if(parseFloat(target.value) > max && max !== null) target.value = max;

            target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok');
            return target.value;
        },
        getOptionByName(name) {
            switch(name) {
                case 'deal':
                    return this.preset.deal;

                case 'dealMargin':
                    return this.preset.dealMargin;

                case 'minPrice':
                    return this.preset.minPrice;

                case 'maxPrice':
                    return this.preset.maxPrice;

                case 'toSpend':
                    return this.preset.toSpend;

                case 'search':
                    return this.preset.search;

                case 'runDelay':
                    return this.preset.runDelay;

                default:
                    return null;
            }
        },
        inFocusOut(e, name, decimalPlaces) {
            let option = this.getOptionByName(name);
            if(option == null) return;

            switch(decimalPlaces) {
                case 1:
                    option = option.toFixed(1);
                    break

                case 2:
                    option = option.toFixed(2);
            }

            e.target.value = option;
            e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok'); 
        },
        inInput(e, name) {
            let option = this.getOptionByName(name);
            if(option == null) return;

            option == e.target.value ? e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok') : e.target.classList.replace('spb-input--val-ok', 'spb-input--val-wrong');
        },
        inEnter(e, name) {
            switch(name) {
                case 'deal':
                    this.preset.deal = parseInt(this.validate(e.target, 0, 100));
                    break;

                case 'dealMargin':
                    this.preset.dealMargin = parseInt(this.validate(e.target, -this.preset.deal, (100 - this.preset.deal)));
                    break;

                case 'minPrice':
                    this.updateUrl = true;
                    this.preset.minPrice = parseFloat(this.validate(e.target, 0, this.preset.maxPrice));
                    break;

                case 'maxPrice':
                    this.updateUrl = true;
                    this.preset.maxPrice = parseFloat(this.validate(e.target, this.preset.minPrice, null));
                    break;

                case 'toSpend':
                    this.preset.toSpend = parseFloat(this.validate(e.target, this.preset.maxPrice, null));
                    break;

                case 'search':
                    this.updateUrl = true;
                    this.preset.search = e.target.value;
                    e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok');
                    break;

                case 'runDelay':
                    this.preset.runDelay = parseFloat(this.validate(e.target, 0, null));
                    break;
            }
        }
    },
    beforeMount() {
        this.updatePreset();
        this.$store.commit('addBot', this);
        this.$store.dispatch('wsSend', {action: 'update', type: 'instances', target: this.$store.getters.botsOptions});
    },
    beforeDestroy() {
        this.isRunning = false;
        this.$store.commit('closeBot', this.index);
        this.$store.dispatch('wsSend', {action: 'update', type: 'instances', target: this.$store.getters.botsOptions});
    }
});