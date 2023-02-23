<template>
  <div class="spb-sale-guard">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">
      Sale guard
    </h3>
    <div class="spb-option">
      <div class="spb--flex spb-option__title">
        <span>Manage</span>
        <span>{{ itemsValue }}</span>
      </div>
      <div class="spb--flex">
        <app-input
          v-model="search"
          class="spb-sale-guard__search"
          :type="'text'"
          :placeholder="'Search...'"
        />
        <select
          v-model="sortModel"
          class="spb-sale-guard__sort-by spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
        >
          <option
            v-for="[key, sort] in itemSortBy"
            :key="'sort-' + key"
            :value="key"
          >
            {{ sort.name }}
          </option>
        </select>
        <div
          class="spb-sort-dir spb--rounded-small spb--background-image-center spb--cursor-pointer"
          :class="sortDirClass"
          @click="sortDirAsc = !sortDirAsc"
        />
      </div>
    </div>
    <div class="spb-sale-guard__items-header">
      <div class="spb-item__column spb-item__name">
        Item
      </div>
      <div class="spb-item__column spb-item__price">
        Price
      </div>
      <div class="spb-item__column spb-item__min-price">
        Min price
      </div>
      <div class="spb-item__column spb-item__max-price">
        Max price
      </div>
      <div class="spb-item__column spb-item__watch">
        Watch
      </div>
      <div class="spb-item__column spb-item__info">
        Info
      </div>
    </div>
    <div class="spb-sale-guard__items">
      <div class="spb-sale-guard__margin-wrapper">
        <sale-guard-item
          v-for="data in filteredItems"
          :key="'item-on-sale-' + data.item.id"
          :item="data.item"
          :metadata="data.metadata"
        />
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
          v-for="(action, index) in actions"
          :key="`${action.name}-${index}`"
          class="spb-sale-guard__control spb--flex"
          :disabled="actionsDisabled"
          @click="disableActions(action.callback())"
        >
          <span :class="['spb-sale-guard__control-icon', 'spb--background-image-center', action.class]" />
          <span class="spb-sale-guard__control-name">
            {{ action.name }}
          </span>
        </button>
        <div
          class="spb-sale-guard__control spb--flex"
        >
          <div class="spb-sale-guard__control-icon spb--background-image-center spb-sale-guard__control-items" />
          <div class="spb-sale-guard__control-name">
            {{ itemsOnSale.size }} Items
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { SPB_LOG, round } from '@/utils'
import actionMixin from '@/mixins/actionMixin'
import processMixin from '@/mixins/processMixin'
import itemFilterMixin from '@/mixins/itemFilterMixin'
import AppInput from '@/components/ui/AppInput'
import SaleGuardItem from '@/components/item/SaleGuardItem'
import alertType from '@/enums/alertType'
import tabWindowState from '@/enums/tabWindowState'
import itemSortType from '@/enums/itemSortType'
import { itemOnSale, market } from '@/api/shadowpay'

export default {
  name: 'SaleGuardTab',
  components: {
    AppInput,
    SaleGuardItem
  },
  mixins: [actionMixin, processMixin, itemFilterMixin],
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  emits: ['statusUpdate'],
  data() {
    return {
      sortModel: itemSortType.MARKET_PRICE,
      timeoutId: null,
      actions: [
        { name: 'Refresh', class: 'spb-sale-guard__control-refresh', callback: () => this.refreshItems() },
        { name: 'Adjust', class: 'spb-sale-guard__control-adjust', callback: () => this.adjustTracked() },
        { name: 'Add all', class: 'spb-sale-guard__control-add-all', callback: () => this.startTrackAll() },
        { name: 'Remove all', class: 'spb-sale-guard__control-remove-all', callback: () => this.stopTrackAll() }
      ]
    }
  },
  computed: {
    ...mapState({
      itemsOnSale: state => state.saleGuard.items,
      saleGuardItemsLoaded: state => state.saleGuard.loaded
    }),
    ...mapGetters({
      trackedItems: 'saleGuard/trackedItems'
    }),
    updateDelay() {
      return this.$store.getters['app/config']('saleGuardUpdateDelay')
    },
    itemBidStep() {
      return this.$store.getters['app/config']('saleGuardBidStep')
    },
    filteredItems() {
      return [...this.itemsOnSale.values()]
        .filter(data => data.item._search_steam_hash_name.includes(this.search.toLowerCase()))
        .sort((a, b) => this.itemSortBy.get(this.sortModel).callback(this.sortDirAsc)(a.item, b.item))
    },
    toggleProcessButtonClass() {
      return [
        !this.isProcessTerminated ? 'spb-button--red' : 'spb-button--green'
      ]
    },
    itemsValue() {
      const value = [...this.itemsOnSale.values()].reduce((a, e) => a + e.item.price_market_usd, 0)

      return '$ ' + value.toFixed(2)
    }
  },
  watch: {
    saleGuardItemsLoaded(value) {
      this.$emit('statusUpdate', value
        ? (!this.isProcessTerminated ? tabWindowState.RUNNING : tabWindowState.OK)
        : tabWindowState.ERROR
      )
    }
  },
  methods: {
    ...mapMutations({
      setItemMarketPrice: 'saleGuard/setItemMarketPrice'
    }),
    ...mapActions({
      loadSaleGuardItems: 'saleGuard/loadSaleGuardItems',
      loadItemsOnSale: 'saleGuard/loadItemsOnSale',
      adjustTracked: 'saleGuard/adjustTracked',
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
    async updateTrackedItemPrice(item, metadata, newPrice) {
      try {
        const { status, error_message } = await itemOnSale.update(item.id, newPrice)

        if (status === 'error' && error_message === 'bid_item_not_exist') {
          await this.stopTrack({
            id: metadata.databaseId,
            showAlert: false
          })

          await this.loadItemsOnSale()

          return
        }

        if (status === 'success') {
          this.setItemMarketPrice({
            id: item.id,
            price: newPrice
          })
        }
      } catch (err) {
        SPB_LOG('Cant update price\n', err)
      }
    },
    async checkTrackedItemPrice(trackedItem) {
      const { item, metadata } = trackedItem

      try {
        const { status, items: marketItems } = await market.getItems({
          item_id: item.item_id,
          price_from: metadata.minPrice,
          price_to: metadata.maxPrice,
          game: 'csgo',
          stack: false,
          sort: 'asc',
          sort_dir: 'asc',
          sort_column: 'price',
          limit: 50,
          offset: 0
        })

        if (status !== 'success') {
          return
        }

        let newPrice = metadata.maxPrice

        for (const marketItem of marketItems) {
          if (marketItem.is_my_item) {
            continue
          }

          let targetPrice = round(marketItem.price_market_usd - this.itemBidStep)

          if (targetPrice > metadata.minPrice) {
            newPrice = this.isFriendItem(marketItem.user_id) ? marketItem.price_market_usd : targetPrice

            break
          }
        }

        if (item.price_market_usd !== newPrice) {
          await this.updateTrackedItemPrice(item, metadata, newPrice)
        }
      } catch (err) {
        SPB_LOG('\n', new Error(err))
      }
    },
    async handleTrackedItems(trackedItems) {
      this.setProcessRunning()

      const { value: trackedItem, done } = trackedItems.next()

      if (done) {
        this.run()

        return
      }

      await this.checkTrackedItemPrice(trackedItem)

      if (this.isProcessTerminating) {
        this.toggleProcess()

        return
      }

      this.timeoutId = setTimeout(() => this.handleTrackedItems(trackedItems), this.updateDelay * 1000)

      this.setProcessIdle()
    },
    run() {
      this.setProcessIdle()

      if ([...this.trackedItems()].length === 0) {
        this.pushAlert({
          type: alertType.INFO,
          message: 'Sale Guard terminated - empty set'
        })

        this.toggleProcess()

        return
      }

      this.handleTrackedItems(
        this.trackedItems()
      )
    },
    toggleProcess() {
      if (this.isProcessRunning) {
        this.setProcessTerminating()

        return
      }

      if (this.isProcessTerminated) {
        this.$emit('statusUpdate', tabWindowState.RUNNING)
        this.run()

        return
      }

      clearTimeout(this.timeoutId)

      this.setProcessTerminated()

      this.$emit('statusUpdate', this.saleGuardItemsLoaded ? tabWindowState.OK : tabWindowState.ERROR)
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

.spb-sale-guard__control-adjust {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/stack.svg');
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