<template>
    <div class="spb-home">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Home</h3>
        <div class="spb-home__views-wrapper">
            <div class="spb-home__views spb--cursor-pointer spb--rounded-small spb--flex">
                <div 
                    @click="currentView = views.ACTIVE" 
                    :class="viewClass(views.ACTIVE)"
                >
                    Active
                </div>
                <div 
                    @click="() => {
                        currentView = views.BUY_HISTORY
                        clearPendingStatus()
                    }" 
                    :class="viewClass(views.BUY_HISTORY)"
                >
                    Buy history
                </div>
            </div>
        </div>
        <div 
            v-if="currentView == views.ACTIVE"
            class="spb-option"
        >
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
                    class="spb-home__sort-by spb-input-field spb-input-field--ok spb--font-size-medium spb--rounded-small"
                    v-model="sortByModel"
                    @change="updateSorter(sortByModel)"
                >
                    <option v-for="sort in Object.values(sortBy)"
                        :key="'sort-' + sort.id"
                        :value="sort.id"
                    >
                        {{ sort.name }}
                    </option>
                </select>
                <div 
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
                v-if="currentView == views.ACTIVE" 
                class="spb-home__items-active"
            >
                <Item 
                    v-for="item in toConfirmItems"  
                    :type="itemTypes.TO_CONFIRM" 
                    :item="item" 
                    :key="'item-' + item.id"
                    @overBuyButton="freezeToConfirm"
                >
                </Item>
            </div>
            <div 
                v-else 
                class="spb-home__items-buy-history"
            >
                <Item 
                    v-for="item in pendingItems" 
                    :type="itemTypes.PENDING" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </Item> 
                <Item 
                    v-for="item in finishedItems" 
                    :type="itemTypes.FINISHED" 
                    :item="item" 
                    :key="'item-' + item.id"
                >
                </Item> 
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
            sorter: null,
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
            itemTypes: state => state.bots.itemTypes,
            tabStates: state => state.app.tabStates,
            finishedItems: state => state.bots.items.finished,
            sortBy: state => state.item.sortBy
        }),
        ...mapGetters({
            botsRunning: 'bots/running'
        }),
        toConfirmItems() {
            let items = this.frozenToConfirm ? this.itemsCache.toConfirm : this.$store.getters['bots/items'](this.itemTypes.TO_CONFIRM)
            return items
                .sort(this.sorter)
                .filter(item => item._search_steam_hash_name
                    .search(this.search.toLowerCase()) 
                    > -1
                )
        },
        pendingItems() {
            return this.$store.getters['bots/items'](this.itemTypes.PENDING)
        },
        sortDirClass() {
            const className = 'spb-home__sort-dir spb--rounded-small spb--background-image-center spb--cursor-pointer'
            return className + (this.sortDirAsc ? ' spb-home__sort-dir--asc' : ' spb-home__sort-dir--desc')
        }
    },
    methods: {
        viewClass(view) {
            const className = 'spb-home__view spb--rounded-small'
            return className + (this.currentView == view ? ` spb-home__view--active` : '')
        },
        freezeToConfirm(value) {
            if(value) this.itemsCache.toConfirm = this.$store.getters['bots/items'](this.itemTypes.TO_CONFIRM)
            this.frozenToConfirm = value
        },
        clearPendingStatus() {
            if(this.$parent.$parent.status == this.tabStates.PENDING) {
                this.$emit('statusUpdate', this.botsRunning ? this.tabStates.RUNNING : this.tabStates.IDLE)
            }
        },
        updateSorter(id) {
            switch(id) {
                case 1:
                    this.sorter = (a, b) => (b.discount - a.discount) * (this.sortDirAsc ? -1 : 1)
                    break

                case 2:
                    this.sorter = (a, b) => (b.floatvalue - a.floatvalue) * (this.sortDirAsc ? -1 : 1)
                    break

                default:
                    this.sorter = (a, b) => (b._real_discount - a._real_discount) * (this.sortDirAsc ? -1 : 1)
                    break
            }
        }
    },
    beforeMount() {
        this.updateSorter(this.sortByModel)
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
    margin: 0 4px;
    width: 150px;
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
</style>