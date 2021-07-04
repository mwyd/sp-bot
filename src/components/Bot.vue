<template>
    <div class="spb-bot">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Options - Bot #{{ id }}</h3>
        <div class="spb--flex spb-bot__wrapper">
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal</span>
                    <input-field 
                        v-model.number="preset.deal"
                        :type="'number'"
                        :validator="value => (value >= 0 && value <= 100)"
                        :model-updated="checkToConfirm"
                    >
                    </input-field>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item min price</span>
                    <input-field 
                        v-model.number="preset.minPrice"
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= preset.maxPrice)"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Preset</span>
                        <select 
                            class="spb-bot__preset-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
                            v-model="presetIdModel"
                        >
                            <option 
                                v-for="pair in sortedPresets(true)" 
                                :key="'preset-' + pair[0]" 
                                :value="pair[0]"
                            >
                                {{ pair[1].name }}
                            </option>
                        </select>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">Search</span>
                    <input-field 
                        v-model="preset.search"
                        :type="'text'" 
                        :placeholder="'Search...'"
                    >
                    </input-field>
                </div> 
            </div>
            <div>
                <div class="spb-option">
                    <span class="spb-option__description">% Deal margin</span>
                    <input-field 
                        v-model.number="preset.dealMargin"
                        :type="'number'" 
                        :validator="value => (value >= -preset.deal && value <= 100 - preset.deal)"
                        :model-updated="checkToConfirm"
                    >
                    </input-field>
                </div>  
                <div class="spb-option">
                    <span class="spb-option__description">$ Item max price</span>
                    <input-field 
                        v-model.number="preset.maxPrice"
                        :type="'number'" 
                        :validator="value => (value >= preset.minPrice && value <= preset.toSpend)"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">$ Money to spend</span>
                    <input-field 
                        v-model.number="preset.toSpend"
                        :type="'number'" 
                        :validator="value => (value >= preset.maxPrice && value <= 1000000)"
                        :model-updated="checkToConfirm"
                    >
                    </input-field>
                </div>
                <div class="spb-option">
                    <span class="spb-option__description">Refresh time</span>
                    <input-field
                        v-model.number="preset.runDelay" 
                        :type="'number'" 
                        :validator="value => (value >= 0 && value <= 1200)"
                    >
                    </input-field>
                </div>
            </div>
        </div>
        <button 
            class="spb-bot__run-button spb-button"
            :class="toggleIsRunningButtonClass"
            @click="toggleIsRunning" 
        >
        {{ isRunning ? 'stop' : 'start' }}
        </button>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { SPB_LOG } from '../utils/index.js'
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
            initDate: Date.now(),
            lastPendingUpdate: Date.now(),
            pendingUpdateDelay: 10,
            items: {
                filtered: [],
                toConfirm: new Map(),
                pending: new Map()
            }
        }
    },
    computed: {
        ...mapState({
            csrfCookie: state => state.app.shadowpay.csrfCookie,
            notificationSound: state => state.app.notificationSound,
            alertTypes: state => state.app.alertTypes,
            tabStates: state => state.app.tabStates,
            getItemsUrl: state => state.app.shadowpay.api.MARKET_ITEMS,
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
                this.preset = {...this.getPreset(this.presetId)}
                this.checkToConfirm()
            }
        },
        toggleIsRunningButtonClass() {
            return [
                this.isRunning ? 'spb-button--red' : 'spb-button--green'
            ]
        }
    },
    methods: {
        ...mapMutations({
            setCsrfCookie: 'app/setCsrfCookie',
            startTrack: 'bots/addBot',
            stopTrack: 'bots/closeBot'
        }),
        ...mapActions({
           updateAlerts: 'app/updateAlerts' 
        }),
        sortedPresets(sortAsc = true) {
            return this.$store.getters['presetManager/sortedPresets'](sortAsc)
        },
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        },
        clearDopplerHashName(hashName) {
            return this.$store.getters['item/steamHashName'](hashName)
        },
        clear() {
            clearTimeout(this.timeoutId)
            this.items.filtered = []
            this.items.pending.forEach(item => item._current_run = false)
            this.items.toConfirm = new Map()
            this.moneySpent = 0
        },
        toggleIsRunning() {
            if(this.isRunning) {
                this.isRunning = false
                this.$emit('statusUpdate', this.tabStates.IDLE)
                this.clear()
            }
            else {
                this.isRunning = true
                this.$emit('statusUpdate', this.tabStates.RUNNING)
                this.run()
            }
        },
        checkToConfirm() {
            if(!this.isRunning) return

            this.items.toConfirm.forEach(item => {
                if(this.canBuyItem(item)) this.buyItem(item)
            })
        }, 
        updateToConfirm() {
            this.items.toConfirm.forEach(item => {
                const filteredItem = this.items.filtered.find(filteredItem => filteredItem.id == item.id)

                if(filteredItem === undefined) {
                    this.items.toConfirm.delete(item.id)
                    return
                }

                if(filteredItem.price_market_usd != item.price_market_usd) {
                    item.discount = Math.round(filteredItem.discount)
                    item.price = filteredItem.price
                    item.price_market = filteredItem.price_market
                    item.price_usd = filteredItem.price_usd
                    item.price_market_usd = filteredItem.price_market_usd

                    if(item._updated) this.calculateIncome(item)
                    if(this.canBuyItem(item)) this.buyItem(item)
                }
            })       
        },
        calculateIncome(item) {
            item._app_income = ((0.87 * item._steam_price) - item.price_market_usd).toFixed(2)
            item._app_income_percentage = 100 - Math.round((item.price_market_usd - item._app_income) * 100 / item.price_market_usd)
            item._real_discount = 100 - Math.round(item.price_market_usd * 100 / item._steam_price)
        },
        canBuyItem(item) {
            return item._updated && item._real_discount >= this.preset.deal + this.preset.dealMargin && item._steam_volume >= 10
        },
        buyItem(item) {
            if(this.items.pending.get(item.id) || item.price_market_usd + this.moneySpent > this.preset.toSpend) return

            item._current_run = true
            item._transaction_id = null
            item._time_bought = Date.now()

            this.items.pending.set(item.id, item)
            this.moneySpent += item.price_market_usd
    
            fetch(this.buyItemUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${item.id}` +
                    `&price=${item.price_market_usd}` +
                    `&csrf_token=${this.csrfCookie}`
            })
            .then(response => response.json())
            .then(data => {
                SPB_LOG('Buy info', {...data, _item: item})

                const {status, error_message, token, id} = data

                if(status == 'error') {
                    this.items.pending.delete(item.id)
                    this.moneySpent -= item.price_market_usd

                    if(error_message == 'wrong_token') {
                        this.setCsrfCookie(token)
                        this.buyItem(item)
                    }
                    return
                }

                if(status == 'success') {
                    item._transaction_id = id
                        
                    chrome.runtime.sendMessage({
                        action: 'buy_item'
                    })

                    this.notificationSound.play()
                    return
                }
            })
            .catch(err => {
                SPB_LOG('\n', new Error(err))

                this.items.pending.delete(item.id)
                this.moneySpent -= item.price_market_usd
            })
        },
        updatePending() {
            if(this.items.pending.size == 0 || Date.now() - this.lastPendingUpdate < this.pendingUpdateDelay * 1000) return
            
            chrome.runtime.sendMessage({
                action: 'get_bought_items_counter'
            }, 
            response => {
                fetch(this.getBuyHistoryUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `page=1` +
                        `&limit=${response.data}` +
                        `&sort_column=time_finished` +
                        `&sort_dir=desc` +
                        `&custom_id=` +
                        `&date_start=${DateFormat(new Date(this.initDate - (2 * 60 * 60 * 1000)), 'yyyy-mm-dd H:MM:ss')}` +
                        `&date_end=` +
                        `&state=all`
                })
                .then(response => response.json())
                .then(data => {
                    this.lastPendingUpdate = Date.now()

                    const {status, items} = data

                    if(status != 'success') return

                    this.items.pending.forEach(item => {    
                        const transaction = items.find(transaction => transaction.id == item._transaction_id)
                        if(transaction === undefined) return

                        item.state = transaction.state

                        switch(item.state) {
                            case 'cancelled':
                                this.items.pending.delete(item.id)
                                this.finishedItems.push(item)

                                if(item._current_run) this.moneySpent -= item.price_market_usd
                                break

                            case 'finished':
                                this.items.pending.delete(item.id)
                                this.finishedItems.push(item)

                                if(this.items.pending.size == 0 && Math.abs(this.moneySpent - this.preset.toSpend) < this.preset.minPrice) {
                                    this.toggleIsRunning()
                                    this.updateAlerts({
                                        type: this.alertTypes.INFO,
                                        message: `Bot #${this.id} terminated - to spend limit reached`
                                    })
                                }
                                break
                        }
                    })
                })
                .catch(err => {
                    SPB_LOG('\n', new Error(err))
                })
            })
        },
        async run() {
            if(Math.abs(this.moneySpent - this.preset.toSpend) >= this.preset.minPrice) {
                try {    
                    const response = await fetch(this.getItemsUrl +
                        `?types=[]` +
                        `&exteriors=[]` +
                        `&rarities=[]` +
                        `&collections=[]` +
                        `&item_subcategories=[]` +
                        `&float={"from":0,"to":1}` +
                        `&price_from=${this.preset.minPrice}` +
                        `&price_to=${this.preset.maxPrice}` +
                        `&game=csgo` +
                        `&stickers=[]` +
                        `&count_stickers=[]` +
                        `&short_name=` +
                        `&search=${this.preset.search}` +
                        `&stack=false` +
                        `&sort=desc` + 
                        `&sort_dir=desc` +
                        `&sort_column=price_rate` +
                        `&limit=50` +
                        `&offset=0`, {
                        credentials: 'include'
                    })

                    const {status, items} = await response.json()

                    if(status == "success") {
                        this.items.filtered = items
            
                        this.items.filtered = this.items.filtered.filter(item => !item.is_my_item 
                            && item.discount >= this.preset.deal 
                            && item.price_market_usd >= this.preset.minPrice
                        )

                        for(let item of this.items.filtered) {
                            if(this.items.toConfirm.get(item.id)) continue

                            item.discount = Math.round(item.discount)
                            item.price_market_usd = parseFloat(item.price_market_usd)
                            item._updated = false
                            item._search_steam_hash_name = item.steam_market_hash_name.toLowerCase()
                            if(item.phase) item.steam_market_hash_name = this.clearDopplerHashName(item.steam_market_hash_name)

                            await new Promise(resolve => chrome.runtime.sendMessage({
                                action: 'get_steam_market_csgo_item', 
                                params: {
                                    token: this.token,
                                    hash_name: item.steam_market_hash_name
                                }
                            }, 
                            response => {
                                const {success, data} = response

                                if(success) {
                                    item._updated = true
                                    item._steam_price = data.price
                                    item._steam_volume = data.volume

                                    this.calculateIncome(item)

                                    item._onclick = () => {
                                        this.buyItem(item)
                                    }

                                    if(this.canBuyItem(item)) this.buyItem(item)
                                }
                                
                                if(this.isRunning) this.items.toConfirm.set(item.id, item)
                                resolve(response)
                            }))
                        }
                    }
                }
                catch(err) {
                    SPB_LOG('\n', new Error(err))
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

.spb-bot__preset-select {
    background-color: var(--secondary-background-color);
    height: 32px;
}

.spb-bot__wrapper {
    justify-content: space-around;
}

.spb-bot__run-button {
    margin-top: 8px;
}
</style>