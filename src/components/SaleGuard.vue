<template>
    <div class="spb-sale-guard">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Sale guard</h3>
        <div class="spb-option">
            <span class="spb-option__description">Manage</span>
            <div class="spb--flex">
                <app-input 
                    v-model="search"
                    class="spb-sale-guard__search"
                    :type="'text'"
                    :placeholder="'Search...'"
                >
                </app-input>
                <select 
                    class="spb-sale-guard__sort-by spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
                    v-model="sortByModel"
                >
                    <option v-for="sortById in Object.values(sortByTypes)"
                        :key="'sort-' + sortById"
                        :value="sortById"
                    >
                        {{ sortBy.get(sortById).name }}
                    </option>
                </select>
                <div 
                    class="spb-sale-guard__sort-dir spb--rounded-small spb--background-image-center spb--cursor-pointer"
                    :class="sortDirClass"
                    @click="() => sortDirAsc = !sortDirAsc"
                ></div>
            </div>
        </div>
        <div class="spb-sale-guard__items-header">
            <div class="spb-item__column spb-item__name">Item</div>
            <div class="spb-item__column spb-item__price">Price</div>
            <div class="spb-item__column spb-item__min-price">Min price</div>
            <div class="spb-item__column spb-item__max-price">Max price</div>
            <div class="spb-item__column spb-item__watch">Watch</div>
            <div class="spb-item__column spb-item__info">Info</div>
        </div>
        <div class="spb-sale-guard__items">
            <div class="spb-sale-guard__margin-wrapper">
                <sale-guard-item v-for="data in filteredItems"
                    :key="'item-on-sale-' + data.item.id"
                    :item="data.item"
                    :metadata="data.metadata"
                >
                </sale-guard-item>
            </div>
        </div>
        <div class="spb--flex spb-sale-guard__footer">
            <button 
                class="spb-sale-guard__toggle-button spb-button"
                :class="toggleProcessButtonClass"
                :disabled="actionsDisabled || isProcessTerminating"
                @click="toggleProcess"
            >
                {{ !isProcessTerminated ? 'stop' : 'start' }} 
            </button>
            <div class="spb--flex spb--font-weight-light spb--font-size-medium">
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="disableActions(refreshItems())"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-refresh"></div>
                    <div class="spb-sale-guard__control-name">Refresh</div>
                </button>
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="disableActions(startTrackAll())"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-add-all"></div>
                    <div class="spb-sale-guard__control-name">Add all</div>
                </button>
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="disableActions(stopTrackAll())"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-remove-all"></div>
                    <div class="spb-sale-guard__control-name">Remove all</div>
                </button>
                <div 
                    class="spb-sale-guard__control spb--flex"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-items"></div>
                    <div class="spb-sale-guard__control-name">{{ itemsOnSale.size }} Items</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { SPB_LOG, roundNumber } from '../utils/index.js'
import actionMixin from '../mixins/actionMixin.js'
import processMixin from '../mixins/processMixin.js'
import AppInput from './ui/AppInput.vue'
import SaleGuardItem from './SaleGuardItem.vue'

export default {
    name: 'SaleGuard',
    components: {
        AppInput,
        SaleGuardItem
    },
    mixins: [actionMixin, processMixin],
    props: {
        id: Number
    },
    emits: ['statusUpdate'],
    data() {
        return {
            search: '',
            sortByModel: 3,
            sortDirAsc: false,
            timeoutId: null
        }
    },
    computed: {
        ...mapState({
            csrfCookie: state => state.app.shadowpay.csrfCookie,
            sortByTypes: state => state.item.sortByTypes,
            sortBy: state => state.item.sortBy,
            itemsOnSale: state => state.saleGuard.items,
            saleGuardItemsLoaded: state => state.saleGuard.loaded,
            tabStates: state => state.app.tabStates,
            getStackedItems: state => state.app.shadowpay.api.STACKED_ITEMS,
            setItemPriceUrl: state => state.app.shadowpay.api.SAVE_ITEM_PRICE,
            alertTypes: state => state.app.alertTypes
        }),
        ...mapGetters({
            trackedItems: 'saleGuard/trackedItems'
        }),
        itemUpdateDelay() {
            return this.$store.getters['app/config']('saleGuardItemUpdateDelay')
        },
        itemBidStep() {
            return this.$store.getters['app/config']('saleGuardBidStep')
        },
        filteredItems() {
            return [...this.itemsOnSale.values()]
                .filter(data => data.item._search_steam_hash_name.search(this.search.toLowerCase()) > -1)
                .sort((a, b) => this.sortBy.get(this.sortByModel).callback(this.sortDirAsc)(a.item, b.item))
        },
        sortDirClass() {
            return [
                this.sortDirAsc ? 'spb-sale-guard__sort-dir--asc' : 'spb-sale-guard__sort-dir--desc'
            ]
        },
        toggleProcessButtonClass() {
            return [
                !this.isProcessTerminated ? 'spb-button--red' : 'spb-button--green'
            ]
        }
    },
    watch: {
        saleGuardItemsLoaded(value) {
            this.$emit('statusUpdate', value ? (!this.isProcessTerminated ? this.tabStates.RUNNING : this.tabStates.OK) : this.tabStates.ERROR)
        }
    },
    methods: {
        ...mapMutations({
            setCsrfCookie: 'app/setCsrfCookie',
            setItemMarketPrice: 'saleGuard/setItemMarketPrice'
        }),
        ...mapActions({
            loadSaleGuardItems: 'saleGuard/loadSaleGuardItems',
            loadItemsOnSale: 'saleGuard/loadItemsOnSale',
            toggleSaleGuard: 'saleGuard/toggleSaleGuard',
            startTrackAll: 'saleGuard/startTrackAll',
            stopTrackAll: 'saleGuard/stopTrackAll',
            stopTrack: 'saleGuard/stopTrack',
            pushAlert: 'app/pushAlert'
        }),
        isFriendItem(userId) {
            return this.$store.getters['friendManager/itemOwner'](userId)
        },
        async refreshItems() {
            await this.loadItemsOnSale()
            await this.loadSaleGuardItems()
        },
        stopProcess() {
            this.$emit('statusUpdate', this.saleGuardItemsLoaded ? this.tabStates.OK : this.tabStates.ERROR)
            this.setProcessTerminated()
        },
        toggleProcess() {
            switch(this.processState) {
                case this.processStates.IDLE:
                    clearTimeout(this.timeoutId)
                    this.stopProcess()
                    break

                case this.processStates.RUNNING:
                    this.setProcessTerminating()
                    break

                case this.processStates.TERMINATED:
                    this.$emit('statusUpdate', this.tabStates.RUNNING)
                    this.run()
                    break
            }
        },
        updateItemPrice(item, metadata, newPrice) {
            fetch(this.setItemPriceUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${item.id}` +
                    `&price=${newPrice}` +
                    `&csrf_token=${this.csrfCookie}`
            })
            .then(response => response.json())
            .then(({status, error_message, token}) => {
                if(status == 'success') {
                    this.setItemMarketPrice({
                        id: item.id,
                        price: newPrice
                    })
                }
                else {
                    switch(error_message) {
                        case 'wrong_token':
                            this.setCsrfCookie(token)
                            this.updateItemPrice(item, metadata, newPrice)
                            break

                        case 'bid_item_not_exist':
                            this.stopTrack({
                                id: metadata.databaseId,
                                showAlert: false
                            })
                            this.loadItemsOnSale()
                            break
                    }
                }
            })
            .catch(err => SPB_LOG('Cant update price\n', err))
        },
        async run() {
            this.setProcessRunning()

            if(this.trackedItems.length == 0) {
                this.pushAlert({
                    type: this.alertTypes.INFO,
                    message: 'Sale Guard terminated - empty set'
                })

                this.setProcessTerminating()
            }

            try {
                for(let {item, metadata} of this.trackedItems) {
                    const response = await fetch(this.getStackedItems +
                            `?item_id=${item.item_id}` +
                            `&price_from=${metadata.minPrice}` +
                            `&price_to=${metadata.maxPrice}` +
                            `&game=csgo` +
                            `&stack=false` +
                            `&sort=asc` + 
                            `&sort_dir=asc` +
                            `&sort_column=price` +
                            `&limit=50` +
                            `&offset=0`, {
                            credentials: 'include'
                        })

                    const {status, items} = await response.json()

                    if(status != 'success') continue

                    let newPrice = metadata.maxPrice

                    for(let marketItem of items) {
                        if(marketItem.is_my_item || marketItem.item_id != item.item_id) continue

                        if(marketItem.price_market_usd - this.itemBidStep > metadata.minPrice) {
                            newPrice = this.isFriendItem(marketItem.user_id) 
                                ? marketItem.price_market_usd
                                : roundNumber(marketItem.price_market_usd - this.itemBidStep)
                            break
                        }
                    }

                    if(item.price_market_usd == newPrice) continue

                    this.updateItemPrice(item, metadata, newPrice)
                }
            }
            catch(err) {
                SPB_LOG('\n', new Error(err))
            }

            switch(this.processState) {
                case this.processStates.RUNNING:
                    this.timeoutId = setTimeout(this.run, this.itemUpdateDelay * 1000)
                    this.setProcessIdle()
                    break

                case this.processStates.TERMINATING:
                    this.stopProcess()
                    break
            }
        }
    }
}
</script>

<style scoped>
.spb-sale-guard {
    width: 80vw;
    min-width: 720px;
    max-width: 1024px;
}

.spb-sale-guard__items-header {
    display: flex;
    padding-top: 6px;
}

.spb-sale-guard__search {
    width: 100%;
    margin-right: 4px;
}

.spb-sale-guard__sort-by {
    background-color: var(--secondary-background-color);
    margin: 0 4px;
    width: 150px;
    height: 32px;
    flex-shrink: 0;
}

.spb-sale-guard__sort-dir {
    margin-left: 4px;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background-color: var(--secondary-background-color);
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/arrow.svg');
}

.spb-sale-guard__sort-dir--desc {
    transform: rotate(90deg);
}

.spb-sale-guard__sort-dir--asc {
    transform: rotate(-90deg);
}

.spb-sale-guard__items {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
}

.spb-sale-guard__footer {
    justify-content: space-between;
    padding-top: 10px;
}

.spb-sale-guard__toggle-button {
    width: 150px;
    margin: 0 2px;
}

.spb-sale-guard__control {
    margin: 0 8px;
    color: inherit;
    background: transparent;
    border: none;
    outline: none;
    font-weight: normal;
}

.spb-sale-guard__control-icon {
    margin-right: 4px;
    height: 16px;
    width: 16px;
}

.spb-sale-guard__control-refresh {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/refresh.svg');
}

.spb-sale-guard__control-add-all {
    transform: rotate(-90deg);
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/arrow.svg');
}

.spb-sale-guard__control-remove-all {
    transform: rotate(90deg);
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/arrow.svg');
}

.spb-sale-guard__control-items {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/pack.svg');
}
</style>