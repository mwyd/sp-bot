Vue.component('bot-settings', {
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
            notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
            initDate: new Date(),
            apiUrls: {
                getItems: 'https://api.shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12558.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
                buyItem: 'https://api.shadowpay.com/api/market/buy_item',
                getBuyHistory: 'https://api.shadowpay.com/en/profile/get_bought_history'
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
        async run() {
            this.toggleStart()
            while(this.isRunning) {
                console.log(1)
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
                    if(this.validate(e.target.value, 0, null)) {
                        this.settings.minPrice = parseFloat(e.target.value)
                        e.target.classList.replace('input--val-wrong', 'input--val-ok')
                    }
                    else this.inFocusOut(e, name)
                    break

                case 'maxPrice':
                    if(this.validate(e.target.value, 0, null)) {
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
    beforeDestroy() {
        this.isRunning = false
    }
})