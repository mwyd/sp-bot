<template>
    <div class="spb-bot">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Options - Bot #{{ id }}</h3>
        <div class="spb--flex spb-bot__wrapper">
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal</span>
                    <InputField 
                        v-model.number="preset.deal"
                        :type="'number'"
                        :validator="value => (value >= 0 && value <= 100)"
                    >
                    </InputField>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item min price</span>
                    <InputField 
                        v-model.number="preset.minPrice"
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= preset.maxPrice)"
                        :modelUpdated="() => updateUrl = true"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Preset</span>
                        <select 
                            class="spb-input-field spb-input-field--ok spb--font-size-medium spb--rounded-small"
                            v-model="presetIdModel"
                        >
                            <option 
                                v-for="pair in presets" 
                                :key="'preset-' + pair[0]" 
                                :value="pair[0]"
                            >
                                {{ pair[1].name }}
                            </option>
                        </select>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">Search</span>
                    <InputField 
                        v-model="preset.search"
                        :type="'text'" 
                        :placeholder="'Search...'"
                        :modelUpdated="() => updateUrl = true"
                    >
                    </InputField>
                </div> 
            </div>
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal margin</span>
                    <InputField 
                        v-model.number="preset.dealMargin"
                        :type="'number'" 
                        :validator="value => (value >= -preset.deal && value <= 100 - preset.deal)"
                    >
                    </InputField>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item max price</span>
                    <InputField 
                        v-model.number="preset.maxPrice"
                        :type="'number'" 
                        :validator="value => (value >= preset.minPrice && value <= preset.toSpend)"
                        :modelUpdated="() => updateUrl = true"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">$ Money to spend</span>
                    <InputField 
                        v-model.number="preset.toSpend"
                        :type="'number'" 
                        :validator="value => (value >= preset.maxPrice && value <= 1000000)"
                    >
                    </InputField>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Refresh time</span>
                    <InputField
                        v-model.number="preset.runDelay" 
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= 1200)"
                    >
                    </InputField>
                </div>
            </div>
        </div>
        <button 
            :class="'spb-bot__run-button spb-button ' + (isRunning ? 'spb-button--red' : 'spb-button--green')"
            @click="toggleStart" 
        >
        {{ isRunning ? 'stop' : 'start' }}
        </button>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import DateFormat from 'dateformat'
import InputField from './InputField.vue'

export default {
    name: 'Bot',
    components: {
        InputField
    },
    props: {
        id: Number
    },
    emits: ['statusUpdate'],
    data() {
        return {
            isRunning: false,
            timeoutId: null,
            presetId: 0,
            preset: {},
            moneySpent: 0,
            updateUrl: true,
            initDate: Date.now(),
            lastPendingUpdate: Date.now(),
            pendingUpdateDelay: 10,
            apiUrls: {
                getItems: this.$store.state.app.shadowpay.api.MARKET_ITEMS
            },
            items: {
                filtered: [],
                toConfirm: [],
                pending: []
            }
        }
    },
    computed: {
        ...mapState({
            csrfCookie: state => state.app.shadowpay.csrfCookie,
            notificationSound: state => state.app.notificationSound,
            tabStates: state => state.app.tabStates,
            buyItemUrl: state => state.app.shadowpay.api.BUY_ITEM,
            getBuyHistoryUrl: state => state.app.shadowpay.api.BUY_HISTORY,
            presets: state => state.presetManager.presets,
            finishedItems: state => state.bots.items.finished,
            token: state => state.session.token
        }),
        presetIdModel: {
            get() {
                return this.presetId
            },
            set(value) {
                this.presetId = value
                this.updateUrl = true
                this.preset = {...this.getPreset(this.presetId)}
            }
        }
    },
    methods: {
        ...mapMutations({
            setCsrfCookie: 'app/setCsrfCookie',
            startTrack: 'bots/addBot',
            stopTrack: 'bots/closeBot'
        }),
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        },
        toggleStart() {
            if(this.isRunning) {
                this.isRunning = false
                clearTimeout(this.timeoutId)
                this.clear()
                this.$emit('statusUpdate', this.tabStates.IDLE)
            }
            else {
                this.isRunning = true
                this.run()
                this.$emit('statusUpdate', this.tabStates.RUNNING)
            }
        },
        clear() {
            for(let pendingItem of this.items.pending) pendingItem._current_run = false
            this.items.toConfirm = []
            this.moneySpent = 0
        },
        clearDopplerHashName(hashName) {
            return this.$store.getters['item/steamHashName'](hashName)
        },
        updateGetItemsUrl() {
            if(this.updateUrl) {
                let getItemsURL = new URL(this.apiUrls.getItems)

                getItemsURL.searchParams.set('price_from', this.preset.minPrice)
                getItemsURL.searchParams.set('price_to', this.preset.maxPrice)
                getItemsURL.searchParams.set('search', this.preset.search)

                this.apiUrls.getItems = getItemsURL.toString()
                this.updateUrl = false
            }
        },
        addToConfirm(item) {
            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) != -1 || !this.isRunning) return
            
            item._onclick = () => {this.buyItem(item)}
            this.items.toConfirm.push(item)
        },
        updateToConfirm() {       
            for(let i = this.items.toConfirm.length - 1; i >= 0; i--) {
                let tcItem = this.items.toConfirm[i]
                let item = this.items.filtered.find(_item => _item.id == tcItem.id)
                
                if(item === undefined) {
                    this.items.toConfirm.splice(i, 1)
                    continue
                }
    
                if(item.price_market_usd != tcItem.price_market_usd) {
                    this.items.toConfirm.splice(i, 1)
                    continue
                }

                if(tcItem._updated && tcItem._real_discount >= this.preset.deal + (this.preset.dealMargin) && tcItem._steam_volume > 10) this.buyItem(tcItem)
            }
        },
        buyItem(item, repurchase = false) {
            if(!repurchase) {
                if(this.items.pending.findIndex(_item => _item.id == item.id) != -1 || parseFloat(item.price_market_usd) + this.moneySpent > this.preset.toSpend) return

                item._status = 'pending'
                item._current_run = true
                item._transaction_id = null
                item._time_bought = Date.now()

                this.items.pending.push(item)
                this.moneySpent += parseFloat(item.price_market_usd)
            }
    
            fetch(this.buyItemUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${item.id}&price=${item.price_market_usd}&csrf_token=${this.csrfCookie}`
            })
            .then(res => res.json())
            .then(data => {
                switch(data.status) {
                    case "error":
                        switch(data.error_message) {
                            case 'wrong_token':``
                                this.setCsrfCookie(data.token)
                                this.buyItem(item, true)
                                break

                            default:
                                this.moneySpent -= parseFloat(item.price_market_usd)
                                item._status = 'error'
                                break
                        }
                        break
                        
                    case "success":
                        item._transaction_id = data.id
                        item._status = 'success'
                        
                        chrome.runtime.sendMessage({
                            action: 'buy_item'
                        })
                        this.notificationSound.play()
                        break
                }

                //spbLog('Buy info', {...data, _item: item});
            })
            .catch(err => {
                item._status = 'error'
                this.moneySpent -= parseFloat(item.price_market_usd)
                console.log(err)
                //spbLog('\n', new Error(err))
            })
        },
        updatePending() {
            if(this.items.pending.length == 0 || Date.now() - this.lastPendingUpdate < this.pendingUpdateDelay * 1000) return
            
            chrome.runtime.sendMessage({
                action: 'get_bought_items_counter'
            }, res => {
                fetch(this.getBuyHistoryUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `page=1&limit=${res.data}&sort_column=time_finished&sort_dir=desc&custom_id=&date_start=${DateFormat(new Date(this.initDate - (2 * 60 * 60 * 1000)), 'yyyy-mm-dd H:MM:ss')}&date_end=&state=all`
                })
                .then(res => res.json())
                .then(data => {
                    this.lastPendingUpdate = Date.now()

                    switch(data.status) {
                        case 'success':
                            for(let i = this.items.pending.length - 1; i >= 0 ; i--) {
                                let item = this.items.pending[i]

                                if(item._status == 'error') {
                                    this.items.pending.splice(i, 1)
                                    continue
                                }
    
                                let historyItem = data.items.find(_item => _item.id == item._transaction_id)
                                if(historyItem === undefined) continue

                                item.state = historyItem.state
    
                                switch(item.state) {
                                    case 'cancelled':
                                        this.items.pending.splice(i, 1)
                                        this.finishedItems.push(item)
    
                                        if(item._current_run) this.moneySpent -= parseFloat(item.price_market_usd)
                                        break
    
                                    case 'finished':
                                        this.items.pending.splice(i, 1)
                                        this.finishedItems.push(item)
    
                                        if(this.items.pending.length == 0 && Math.abs(this.moneySpent - this.preset.toSpend) < this.preset.minPrice) this.toggleStart()
                                        break
                                    }
                            }
                            break
                    }
                })
                .catch(err => {
                    console.log(err)
                    //spbLog('\n', new Error(err))
                })
            })
        },
        async run() {
            this.updateGetItemsUrl()
            this.items.filtered = []

            if(Math.abs(this.moneySpent - this.preset.toSpend) >= this.preset.minPrice) {
                try {    
                    const response = await fetch(this.apiUrls.getItems, {credentials: 'include'})
                    let data = await response.json()

                    if(data.status == "success") {
                        this.items.filtered = Array.from(data.items)
            
                        this.items.filtered = this.items.filtered.filter(item => !item.is_my_item)
                        this.items.filtered = this.items.filtered.filter(item => (item.discount >= this.preset.deal && item.price_market_usd >= this.preset.minPrice))
            
                        this.items.filtered.sort((a, b) => b.price_market_usd - a.price_market_usd)

                        for(let item of this.items.filtered) {
                            if(this.items.toConfirm.findIndex(_item => _item.id == item.id) > -1) continue
                            if(item.phase) item.steam_market_hash_name = this.clearDopplerHashName(item.steam_market_hash_name)

                            item.discount = Math.round(item.discount)
                            item._updated = false
                            item._search_steam_hash_name = item.steam_market_hash_name.toLowerCase()

                            chrome.runtime.sendMessage({
                                action: 'get_steam_market_csgo_item', 
                                params: {
                                    hash_name: item.steam_market_hash_name,
                                    token: this.token
                                }
                            }, 
                            response => {
                                const {success, data} = response

                                if(success) {
                                    item._steam_price = data.price
                                    item._steam_volume = data.volume
                                    item._app_income = ((0.87 * data.price) - item.price_market_usd).toFixed(2)
                                    item._app_income_percentage = 100 - Math.round((item.price_market_usd - item._app_income) * 100 / item.price_market_usd)
                                    item._real_discount = 100 - Math.round(item.price_market_usd * 100 / item._steam_price)
                                    item._updated = true
                                }
                                
                                this.addToConfirm(item)
                            })
                        }
                    }
                }
                catch(err) {
                    //spbLog('\n', new Error(err))
                }
            }

            this.updatePending()
            this.updateToConfirm()
                    
            if(this.isRunning) {
                this.timeoutId = setTimeout(() => {
                    this.run()
                }, 1000 * this.preset.runDelay)
            }
        }
    },
    beforeMount() {
        this.presetIdModel = this.presetId
        this.startTrack(this)
    },
    beforeUnmount() {
        this.isRunning = false
        this.stopTrack(this.id)
    }
}
</script>

<style scoped>
.spb-bot {
    display: flex;
    flex-direction: column;
    width: 365px;
    position: relative;
}

.spb-bot__wrapper {
    justify-content: space-around;
}

.spb-bot__run-button {
    margin-top: 8px;
}
</style>