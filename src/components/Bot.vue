<template>
  <div class="spb-bot">
    <h3 class="spb--h3 spb--font-size-large spb--font-weight-heavy">Options - Bot #{{ id }}</h3>
    <div class="spb-bot__preset">
      <div class="spb--flex spb-bot__preset-wrapper">
        <div>
          <div class="spb-option">
            <span class="spb-option__description">% Deal</span>
            <app-input
              v-model.number="preset.deal"
              :type="'number'"
              :validator="value => (value >= -1000 && value <= 100)"
              :model-updated="checkToConfirm"
            >
            </app-input>
          </div>
          <div class="spb-option">
            <span class="spb-option__description">$ Item min price</span>
            <app-input
              v-model.number="preset.minPrice"
              :type="'number'"
              :validator="value => (value >= 0 && value <= preset.maxPrice)"
            >
            </app-input>
          </div>
          <div class="spb-option">
            <span class="spb-option__description">Preset</span>
            <select
              class="spb-bot__preset-select spb-input__field spb-input__field--ok spb--font-size-medium spb--rounded-small"
              v-model="presetModel"
            >
              <option
                v-for="[id, preset] in sortedPresets(true)"
                :key="'preset-' + id"
                :value="id"
              >
                {{ preset.name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <div class="spb-option">
            <span class="spb-option__description">% Deal margin</span>
            <app-input
              v-model.number="dealMargin"
              :type="'number'"
              :validator="value => (value >= -preset.deal && value <= 1000 - preset.deal)"
              :model-updated="checkToConfirm"
            >
            </app-input>
          </div>
          <div class="spb-option">
            <span class="spb-option__description">$ Item max price</span>
            <app-input
              v-model.number="preset.maxPrice"
              :type="'number'"
              :validator="value => (value >= preset.minPrice && value <= 1000000)"
            >
            </app-input>
          </div>
          <div class="spb-option">
            <span class="spb-option__description">Refresh time</span>
            <app-input
              v-model.number="preset.runDelay"
              :type="'number'"
              :validator="value => (value >= 0 && value <= 1200)"
            >
            </app-input>
          </div>
        </div>
      </div>
      <div class="spb-option">
        <span class="spb-option__description">Search</span>
        <app-input
          v-model="preset.search"
          :type="'text'"
          :placeholder="'Search...'"
        >
        </app-input>
      </div>
    </div>
    <button
      class="spb-bot__run-button spb-button"
      :class="toggleProcessButtonClass"
      :disabled="isProcessTerminating"
      @click="toggleProcess"
    >
      {{ !isProcessTerminated ? 'stop' : 'start' }}
    </button>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { calculateDiscount, SPB_LOG } from '@/utils'
import { normalizeMarketItem, inspectItem } from '@/resources/marketItem'
import presetMixin from '@/mixins/presetMixin'
import processMixin from '@/mixins/processMixin'
import AppInput from './ui/AppInput'
import tabWindowState from '@/enums/tabWindowState'
import { market } from '@/api/shadowpay'
import { buffMarketItem, steamMarketItem } from '@/api/conduit'

export default {
  name: 'Bot',
  components: {
    AppInput
  },
  mixins: [presetMixin, processMixin],
  props: {
    id: Number
  },
  emits: ['statusUpdate'],
  data() {
    return {
      timeoutId: null,
      items: {
        filtered: [],
        toConfirm: new Map()
      }
    }
  },
  computed: {
    marketVolumeLimit() {
      return this.$store.getters['app/config']('marketVolumeLimit')
    },
    targetMarket() {
      return this.$store.getters['app/config']('targetMarket')
    },
    toggleProcessButtonClass() {
      return [
        !this.isProcessTerminated ? 'spb-button--red' : 'spb-button--green'
      ]
    }
  },
  watch: {
    presetModel() {
      this.checkToConfirm()
    },
    marketVolumeLimit() {
      this.checkToConfirm()
    }
  },
  beforeMount() {
    this.startTrack(this)
  },
  beforeUnmount() {
    this.setProcessTerminating()
    this.stopTrack(this.id)
  },
  methods: {
    ...mapMutations({
      startTrack: 'bots/addBot',
      stopTrack: 'bots/closeBot',
      deleteAlert: 'app/deleteAlert'
    }),
    ...mapActions({
      buyItem: 'bots/buyItem',
      pushAlert: 'app/pushAlert'
    }),
    clear() {
      this.items.filtered = []

      this.items.toConfirm.forEach(item => {
        item._alerts.forEach(id => this.deleteAlert(id))
      })

      this.items.toConfirm = new Map()
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

      this.clear()
      this.setProcessTerminated()

      this.$emit('statusUpdate', tabWindowState.IDLE)
    },
    checkToConfirm() {
      if (this.isProcessTerminating || this.isProcessTerminated) {
        return
      }

      this.items.toConfirm.forEach(item => {
        if (this.canBuyItem(item)) {
          this.buyItem(item)
        }
      })
    },
    updateToConfirm() {
      this.items.toConfirm.forEach(item => {
        const filteredItem = this.items.filtered.find(filteredItem => filteredItem.id === item.id)

        if (!filteredItem) {
          item._alerts.forEach(id => this.deleteAlert(id))
          this.items.toConfirm.delete(item.id)

          return
        }

        if (filteredItem.price_market_usd !== item.price_market_usd) {
          item.discount = Math.round(filteredItem.discount)
          item.price = filteredItem.price
          item.price_market = filteredItem.price_market
          item.price_usd = filteredItem.price_usd
          item.price_market_usd = filteredItem.price_market_usd

          if (item._buff_updated) {
            item._buff_discount = calculateDiscount(item.price_market_usd, item._buff_price)
          }

          if (item._steam_updated) {
            item._steam_discount = calculateDiscount(item.price_market_usd, item._steam_price)
          }

          if (this.canBuyItem(item)) {
            this.buyItem(item)
          }
        }
      })
    },
    canBuyItem(item) {
      return item[`_${this.targetMarket}_updated`]
        && item[`_${this.targetMarket}_volume`] >= this.marketVolumeLimit
        && item[`_${this.targetMarket}_discount`] >= this.preset.deal + this.dealMargin
    },
    async handleMarketItem(item) {
      normalizeMarketItem(item)
      inspectItem(item)

      item._buff_updated = false
      item._steam_updated = false

      const [buffResponse, steamResponse] = await Promise.all([
        buffMarketItem.single(item.steam_market_hash_name),
        steamMarketItem.single(item._conduit_hash_name)
      ])

      if (buffResponse.success) {
        const { price, volume, good_id } = buffResponse.data

        item._buff_updated = true
        item._buff_price = price
        item._buff_volume = volume
        item._buff_good_id = good_id
        item._buff_discount = calculateDiscount(item.price_market_usd, price)
      }

      if (steamResponse.success) {
        const { price, volume } = steamResponse.data

        item._steam_updated = true
        item._steam_price = price
        item._steam_volume = volume
        item._steam_discount = calculateDiscount(item.price_market_usd, price)
      }

      if (this.canBuyItem(item)) {
        this.buyItem(item)
      }

      this.items.toConfirm.set(item.id, item)
    },
    async run() {
      this.setProcessRunning()

      try {
        const { status, items } = await market.getItems({
          price_from: this.preset.minPrice,
          price_to: this.preset.maxPrice,
          game: 'csgo',
          currency: 'USD',
          search: this.preset.search,
          stack: false,
          sort: 'desc',
          sort_dir: 'desc',
          sort_column: 'price_rate',
          limit: 50,
          offset: 0
        })

        if (status === "success") {
          this.items.filtered = items

          this.items.filtered = this.items.filtered.filter(item => !item.is_my_item
            && item.discount >= this.preset.deal
            && item.price_market_usd >= this.preset.minPrice
          )

          this.updateToConfirm()

          for (let item of this.items.filtered) {
            if (this.items.toConfirm.has(item.id)) {
              continue
            }

            await this.handleMarketItem(item)
          }
        }
      } catch (err) {
        SPB_LOG('\n', new Error(err))
      }

      if (this.isProcessTerminating) {
        this.toggleProcess()

        return
      }

      this.timeoutId = setTimeout(this.run, this.preset.runDelay * 1000)

      this.setProcessIdle()
    }
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

.spb-bot__preset {
  padding: 0 2px;
}

.spb-bot__preset-wrapper {
  justify-content: space-between;
}

.spb-bot__run-button {
  margin-top: 8px;
}
</style>