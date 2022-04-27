<template>
    <div class="spb-home">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Home</h3>
        <app-multiple-switch
            :options="Object.values(views)"
            :selected="currentView"
            @optionUpdate="updateView"
        >
        </app-multiple-switch>
        <div class="spb-option">
            <span class="spb-option__description">Manage</span>
            <div class="spb--flex">
                <app-input 
                    v-model="search"
                    class="spb-home__search"
                    :type="'text'"
                    :placeholder="'Search...'"
                >
                </app-input>
                <select 
                    class="spb-home__sort-by spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
                    v-model="sortByModel"
                >
                    <option v-for="sortById in Object.values(itemSortType)"
                        :key="'sort-' + sortById"
                        :value="sortById"
                    >
                        {{ itemSortBy.get(sortById).name }}
                    </option>
                </select>
                <div 
                    class="spb-home__sort-dir spb--rounded-small spb--background-image-center spb--cursor-pointer"
                    :class="sortDirClass"
                    @click="() => sortDirAsc = !sortDirAsc"
                ></div>
            </div>
        </div>  
        <div class="spb-home__items-header">
            <div class="spb-item__column spb-item__name">Item</div>
            <div class="spb-item__column spb-item__price">Price</div>
            <div class="spb-item__column spb-item__status">Status</div>
            <div class="spb-item__column spb-item__date">{{ currentView == views.ACTIVE ? 'Buy' : 'Date' }}</div>
            <div class="spb-item__column spb-item__info">Info</div>
        </div>
        <div class="spb-home__items">
            <div 
                v-show="currentView == views.ACTIVE" 
                class="spb-home__items-active"
            >
                <home-item 
                    v-for="item in filteredItems(botItemType.TO_CONFIRM)"  
                    :type="botItemType.TO_CONFIRM" 
                    :item="item" 
                    :key="'item-' + item.id"
                    @overBuyButton="freezeToConfirm"
                >
                </home-item>
            </div>
            <div 
                v-show="currentView == views.BUY_HISTORY" 
                class="spb-home__items-buy-history"
            >
                <home-item 
                    v-for="item in filteredItems(botItemType.PENDING)" 
                    :type="botItemType.PENDING" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </home-item> 
                <home-item 
                    v-for="item in filteredItems(botItemType.FINISHED)" 
                    :type="botItemType.FINISHED" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </home-item> 
            </div>
        </div>
        <div class="spb-home__footer spb--font-size-medium">
            <div 
                class="spb--flex spb-home__control"
            >
                <div class="spb-home__control-icon spb--background-image-center spb-home__control-items"></div>
                <div class="spb-home__control-name">
                    {{ countedItems }} Items
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import tabWindowState from '@/enums/tabWindowState'
import HomeItem from './HomeItem'
import AppInput from './ui/AppInput'
import AppMultipleSwitch from './ui/AppMultipleSwitch'
import botItemType from '@/enums/botItemType'
import itemSortType from '@/enums/itemSortType'
import { itemSortBy } from '@/resources/marketItem'
import targetMarketType from '@/enums/targetMarketType'

const views = Object.freeze({
    ACTIVE: 'Active',
    BUY_HISTORY: 'Buy history'
})

export default {
    name: 'Home',
    components: {
        HomeItem,
        AppInput,
        AppMultipleSwitch
    },
    props: {
        id: Number
    },
    emits: ['statusUpdate'],
    data() {
        return {
            itemSortType,
            botItemType,
            views,
            itemSortBy,
            currentView: views.ACTIVE,
            itemsCache: {
                toConfirm: []
            },
            search: '',
            frozenToConfirm: false,
            sortByModel: itemSortType.STEAM_DISCOUNT,
            sortDirAsc: false
        }
    },
    computed: {
        ...mapState({
            finishedItems: state => state.bots.items.finished
        }),
        ...mapGetters({
            itemsCount: 'bots/itemsCount'
        }),
        countedItems() {
            return this.currentView == this.views.ACTIVE 
                ? this.itemsCount(botItemType.TO_CONFIRM) 
                : this.itemsCount(botItemType.PENDING) + this.finishedItems.length 
        },
        toConfirmItems() {
            return this.frozenToConfirm ? this.itemsCache.toConfirm : this.$store.getters['bots/items'](botItemType.TO_CONFIRM)
        },
        pendingItems() {
            return this.$store.getters['bots/items'](botItemType.PENDING)
        },
        sortDirClass() {
            return [
                this.sortDirAsc ? 'spb-home__sort-dir--asc' : 'spb-home__sort-dir--desc'
            ]
        },
        appLoaded() {
            return this.$store.state.app.loaded
        }
    },
    watch: {
        pendingItems(items) {
            if(this.currentView != this.views.BUY_HISTORY && items.length > 0) this.$emit('statusUpdate', tabWindowState.PENDING)
        },
        appLoaded(value) {
            if(value) {
                this.sortByModel = this.$store.getters['app/config']('targetMarket') == targetMarketType.BUFF
                    ? itemSortType.BUFF_DISCOUNT
                    : itemSortType.STEAM_DISCOUNT
            }
        }
    },
    methods: {
        updateView(view) {
            this.currentView = view
            if(view == this.views.BUY_HISTORY) this.clearPendingStatus()
        },
        filteredItems(type) {
            let items = []

            switch(type) {
                case botItemType.TO_CONFIRM:
                    items = this.toConfirmItems
                    break

                case botItemType.PENDING:
                    items = this.pendingItems
                    break

                case botItemType.FINISHED:
                    items = this.finishedItems
                    break
            }

            return items
                .filter(item => item._search_steam_hash_name.includes(this.search.toLowerCase()))
                .sort(this.itemSortBy.get(this.sortByModel).callback(this.sortDirAsc))
        },
        freezeToConfirm(value) {
            if(value) this.itemsCache.toConfirm = this.$store.getters['bots/items'](botItemType.TO_CONFIRM)
            this.frozenToConfirm = value
        },
        clearPendingStatus() {
            if(this.$parent.$parent.status == tabWindowState.PENDING) {
                this.$emit('statusUpdate', tabWindowState.IDLE)
            }
        }
    }
}
</script>

<style scoped>
.spb-home {
    width: 80vw;
    min-width: 720px;
    max-width: 1024px;
}

.spb-home__search {
    width: 100%;
    margin-right: 4px;
}

.spb-home__sort-by {
    background-color: var(--secondary-background-color);
    margin: 0 4px;
    width: 150px;
    height: 32px;
    flex-shrink: 0;
}

.spb-home__sort-dir {
    margin-left: 4px;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    background-color: var(--secondary-background-color);
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/arrow.svg');
}

.spb-home__sort-dir--desc {
    transform: rotate(90deg);
}

.spb-home__sort-dir--asc {
    transform: rotate(-90deg);
}

.spb-home__items-header {
    display: flex;
    padding-top: 6px;
}

.spb-home__items {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
}

.spb-home__footer {
    padding-top: 10px;
    text-align: right;
}

.spb-home__control {
    display: inline-flex;
    margin: 0 8px;
    color: inherit;
    font-weight: normal;
}

.spb-home__control-icon {
    margin-right: 4px;
    height: 16px;
    width: 16px;
}

.spb-home__control-items {
    background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/pack.svg');
}
</style>