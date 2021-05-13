<template>
    <div class="spb-home">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Home</h3>
        <div class="spb-home__wrapper">
            <div class="spb-home__views spb--cursor-pointer spb--rounded-small spb--flex">
                <div 
                    @click="currentView = views.ACTIVE" 
                    :class="stateClass(views.ACTIVE)"
                >
                    Active
                </div>
                <div 
                    @click="() => {
                        currentView = views.BUY_HISTORY
                        statusUpdate(tabStates.IDLE)
                    }" 
                    :class="stateClass(views.BUY_HISTORY)"
                >
                    Buy history
                </div>
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
import { mapState } from 'vuex'
import Item from './Item.vue'

export default {
    name: 'Home',
    components: {
        Item
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
            frozenToConfirm: false
        }
    },
    watch: {
        pendingItems(items) {
            if(this.currentView != this.views.BUY_HISTORY && items.length > 0) this.statusUpdate(this.tabStates.PENDING)
        }
    },
    computed: {
        ...mapState({
            itemTypes: state => state.bots.itemTypes,
            tabStates: state => state.app.tabStates,
            finishedItems: state => state.bots.items.finished
        }),
        toConfirmItems() {
            let items = this.frozenToConfirm ? this.itemsCache.toConfirm : this.$store.getters['bots/items']('toConfirm')
            return items.sort((a, b) => b._real_discount - a._real_discount)
        },
        pendingItems() {
            return this.$store.getters['bots/items']('pending')
        },
    },
    methods: {
        stateClass(view) {
            const className = 'spb-home__view spb--rounded-small'
            return className + (this.currentView == view ? ` spb-home__view--active` : '')
        },
        freezeToConfirm(value) {
            if(value) this.itemsCache.toConfirm = this.$store.getters['bots/items']('toConfirm')
            this.frozenToConfirm = value
        },
        statusUpdate(status) {
            if(this.$parent.$parent.status != status) this.$emit('statusUpdate', status)
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

.spb-home__wrapper {
    width: 100%;
    padding: 10px 0px;
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