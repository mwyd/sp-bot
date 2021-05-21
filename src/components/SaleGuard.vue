<template>
    <div class="spb-sale-guard">
        <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Sale guard</h3>
        <div class="spb-option">
            <span class="spb-option__description">Manage</span>
            <div class="spb--flex">
                <InputField 
                    v-model="search"
                    class="spb-sale-guard__search"
                    :type="'text'"
                    :placeholder="'Search...'"
                >
                </InputField>
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
            <div class="spb-item__column spb-item__update">Update</div>
        </div>
        <div class="spb-sale-guard__items">
            <div class="spb-sale-guard__margin-wrapper">
                <SaleGuardItem v-for="data in filteredItems"
                    :key="'item-on-sale-' + data.item.id"
                    :item="data.item"
                    :metadata="data.metadata"
                    :ref="'sale-guard-item-' + data.item.id"
                >
                </SaleGuardItem>
            </div>
        </div>
        <div class="spb--flex spb-sale-guard__footer">
            <button 
                class="spb-sale-guard__toggle-button spb-button"
                :class="toggleSaleGuardButtonClass"
                :disabled="actionsDisabled"
                @click="toggleSaleGuard"
            >
                {{ saleGuardRunning ? 'stop' : 'start' }} 
            </button>
            <div class="spb--flex spb--font-weight-light spb--font-size-medium">
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="loadItemsOnSale"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-refresh"></div>
                    <div class="spb-sale-guard__control-name">Refresh</div>
                </button>
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="startTrackAll"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-add-all"></div>
                    <div class="spb-sale-guard__control-name">Add all</div>
                </button>
                <button 
                    class="spb-sale-guard__control spb--flex"
                    :disabled="actionsDisabled"
                    @click="stopTrackAll"
                >
                    <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-remove-all"></div>
                    <div class="spb-sale-guard__control-name">Remove all</div>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import InputField from './InputField.vue'
import SaleGuardItem from './SaleGuardItem.vue'

export default {
    name: 'SaleGuard',
    components: {
        InputField,
        SaleGuardItem
    },
    emits: ['statusUpdate'],
    data() {
        return {
            search: '',
            sortByModel: 3,
            sortDirAsc: false,
            actionsDisabled: false
        }
    },
    watch: {
        saleGuardRunning(value) {
            this.$emit('statusUpdate', value ? this.tabStates.RUNNING : this.saleGuardItemsLoaded ? this.tabStates.OK : this.tabStates.ERROR)
        },
        saleGuardItemsLoaded(value) {
            this.$emit('statusUpdate', value ? this.saleGuardRunning ? this.tabStates.RUNNING : this.tabStates.OK : this.tabStates.ERROR)
        }
    },
    computed: {
        ...mapState({
            sortByTypes: state => state.item.sortByTypes,
            sortBy: state => state.item.sortBy,
            saleGuardItems: state => state.saleGuard.items,
            saleGuardItemsLoaded: state => state.saleGuard.loaded,
            saleGuardRunning: state => state.saleGuard.isRunning,
            tabStates: state => state.app.tabStates
        }),
        filteredItems() {
            return [...this.saleGuardItems.values()]
                .filter(data => data.item._search_steam_hash_name.search(this.search.toLowerCase()) > -1)
                .sort((a, b) => this.sortBy.get(this.sortByModel).func(this.sortDirAsc)(a.item, b.item))
        },
        sortDirClass() {
            return [
                this.sortDirAsc ? 'spb-sale-guard__sort-dir--asc' : 'spb-sale-guard__sort-dir--desc'
            ]
        },
        toggleSaleGuardButtonClass() {
            return [
                this.saleGuardRunning ? 'spb-button--red' : 'spb-button--green'
            ]
        }
    },
    methods: {
        ...mapActions({
            loadItemsOnSale: 'saleGuard/loadItemsOnSale',
            toggleSaleGuard: 'saleGuard/toggleSaleGuard'
        }),
        async startTrackAll() {
            this.actionsDisabled = true

            for(let saleGuardItem of Object.values(this.$refs)) {
                if(!saleGuardItem.metadata.tracked) await saleGuardItem.toggleTracked()
            }

            this.actionsDisabled = false
        },
        async stopTrackAll() {
            this.actionsDisabled = true

            for(let saleGuardItem of Object.values(this.$refs)) {
                if(saleGuardItem.metadata.tracked) await saleGuardItem.toggleTracked()
            }

            this.actionsDisabled = false
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
</style>