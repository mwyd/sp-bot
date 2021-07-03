<template>
    <div class="spb-home">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Home</h3>
        <div class="spb-home__views-wrapper">
            <div class="spb-home__views spb--cursor-pointer spb--rounded-small spb--flex">
                <div 
                    class="spb-home__view spb--rounded-small"
                    :class="viewClass(views.ACTIVE)"
                    @click="currentView = views.ACTIVE" 
                >
                    Active
                </div>
                <div 
                    class="spb-home__view spb--rounded-small"
                    :class="viewClass(views.BUY_HISTORY)"
                    @click="() => {
                        currentView = views.BUY_HISTORY
                        clearPendingStatus()
                    }" 
                >
                    Buy history
                </div>
            </div>
        </div>
        <div class="spb-option">
            <span class="spb-option__description">Manage</span>
            <div class="spb--flex">
                <InputField 
                    v-model="search"
                    class="spb-home__search"
                    :type="'text'"
                    :placeholder="'Search...'"
                >
                </InputField>
                <select 
                    class="spb-home__sort-by spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
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
                <Item 
                    v-for="item in filteredItems(itemTypes.TO_CONFIRM)"  
                    :type="itemTypes.TO_CONFIRM" 
                    :item="item" 
                    :key="'item-' + item.id"
                    @overBuyButton="freezeToConfirm"
                >
                </Item>
            </div>
            <div 
                v-show="currentView == views.BUY_HISTORY" 
                class="spb-home__items-buy-history"
            >
                <Item 
                    v-for="item in filteredItems(itemTypes.PENDING)" 
                    :type="itemTypes.PENDING" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </Item> 
                <Item 
                    v-for="item in filteredItems(itemTypes.FINISHED)" 
                    :type="itemTypes.FINISHED" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </Item> 
            </div>
        </div>
        <div class="spb-home__footer spb--font-size-medium">
            <div 
                class="spb--flex spb-home__control"
            >
                <div class="spb-home__control-icon spb--background-image-center spb-home__control-items"></div>
                <div class="spb-home__control-name">
                    {{ currentView == views.ACTIVE 
                        ? itemsCount(itemTypes.TO_CONFIRM) 
                        : itemsCount(itemTypes.PENDING) + finishedItems.length 
                    }} Items
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Item from './Item.vue'
import InputField from './InputField.vue'

export default {
    name: 'Home',
    components: {
        Item,
        InputField
    },
    emits: ['statusUpdate'],
    data() {
        return {
            views: Object.freeze({
                ACTIVE: 'active',
                BUY_HISTORY: 'buy_history'
            }),
            currentView: 'active',
            itemsCache: {
                toConfirm: []
            },
            search: '',
            frozenToConfirm: false,
            sortByModel: 0,
            sortDirAsc: false
        }
    },
    watch: {
        pendingItems(items) {
            if(this.currentView != this.views.BUY_HISTORY && items.length > 0) this.$emit('statusUpdate', this.tabStates.PENDING)
        },
        botsRunning(value) {
            this.$emit('statusUpdate', value ? this.tabStates.RUNNING : this.tabStates.IDLE)
        }
    },
    computed: {
        ...mapState({
            sortByTypes: state => state.item.sortByTypes,
            sortBy: state => state.item.sortBy,
            itemTypes: state => state.bots.itemTypes,
            tabStates: state => state.app.tabStates,
            finishedItems: state => state.bots.items.finished
        }),
        ...mapGetters({
            botsRunning: 'bots/running',
            itemsCount: 'bots/itemsCount'
        }),
        toConfirmItems() {
            return this.frozenToConfirm ? this.itemsCache.toConfirm : this.$store.getters['bots/items'](this.itemTypes.TO_CONFIRM)
        },
        pendingItems() {
            return this.$store.getters['bots/items'](this.itemTypes.PENDING)
        },
        sortDirClass() {
            return [
                this.sortDirAsc ? 'spb-home__sort-dir--asc' : 'spb-home__sort-dir--desc'
            ]
        }
    },
    methods: {
        filteredItems(type) {
            let items = []

            switch(type) {
                case this.itemTypes.TO_CONFIRM:
                    items = this.toConfirmItems
                    break

                case this.itemTypes.PENDING:
                    items = this.pendingItems
                    break

                case this.itemTypes.FINISHED:
                    items = this.finishedItems
                    break
            }

            return items
                .filter(item => item._search_steam_hash_name.search(this.search.toLowerCase()) > -1)
                .sort(this.sortBy.get(this.sortByModel).func(this.sortDirAsc))
        },
        viewClass(view) {
            return [
                this.currentView == view ? 'spb-home__view--active' : ''
            ]
        },
        freezeToConfirm(value) {
            if(value) this.itemsCache.toConfirm = this.$store.getters['bots/items'](this.itemTypes.TO_CONFIRM)
            this.frozenToConfirm = value
        },
        clearPendingStatus() {
            if(this.$parent.$parent.status == this.tabStates.PENDING) {
                this.$emit('statusUpdate', this.botsRunning ? this.tabStates.RUNNING : this.tabStates.IDLE)
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

.spb-home__views-wrapper {
    width: 100%;
    padding: 10px 0px;
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

.spb-home__views {
    background-color: var(--alternative-background-color);
}

.spb-home__view {
    text-align: center;
    width: 100%;
}

.spb-home__view--active {
    background-color: var(--secondary-background-color);
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