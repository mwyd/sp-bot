<template>
  <div class="spb-item__row spb--rounded-small">
    <div class="spb-item spb--flex">
      <div class="spb-item__column spb-item__name">
        <img
          :src="steamMarket.ITEM_IMAGE + item.steam_icon_url_large"
          :alt="item.id"
        >
        <a
          target="_blank"
          class="spb--link"
          :href="steamMarket.ITEM_SELL_LISTINGS + item.steam_market_hash_name"
        >
          {{ item.steam_market_hash_name }}
        </a>
      </div>
      <div class="spb-item__stickers spb--flex">
        <div
          v-for="(sticker, index) in item.stickers"
          :key="'item-sticker-' + index"
          class="spb-item__sticker"
          :data-spb-sticker-name="sticker.name"
          :data-spb-sticker-price="'$ ' + sticker.steam_price"
        >
          <img
            :src="steamMarket.ITEM_IMAGE + sticker.icon_url"
            :alt="sticker.name"
          >
        </div>
      </div>
      <div class="spb-item__column spb-item__price">
        <span class="spb--font-weight-light">$ {{ item.price_market_usd.toFixed(2) }}
          <sup>{{ discountText }}</sup>
        </span>
      </div>
      <slot name="modal-columns" />
      <div
        class="spb-item__column spb-item__info spb-item__info--ico"
        @click="displayStatistics = !displayStatistics"
      />
    </div>
    <div
      v-show="displayStatistics"
      class="spb-item__stats spb--rounded-small"
    >
      <div
        v-if="item.floatvalue"
        class="spb-item__stat"
      >
        Float
        <span :class="isFloatProfitable(item.floatvalue) ? 'spb--text-highlight' : 'spb--text-green'">
          {{ item.floatvalue }}
        </span>
      </div>
      <div
        v-if="item._variant"
        class="spb-item__stat"
      >
        Variant
        <span :class="item._variant.includes('%') ? 'spb--text-highlight' : 'spb--text-blue'">
          {{ item._variant }}
        </span>
      </div>
      <div
        v-for="key in existingSignificantProperties"
        :key="'item.' + key"
        class="spb-item__stat"
      >
        {{ significantProperties[key].name }}
        <span class="spb--text-green">
          {{ significantProperties[key].unit + ' ' + item[key] }}
        </span>
      </div>
      <div class="spb-item__stat spb--cursor-pointer">
        <a
          target="_blank"
          class="spb--link"
          :href="buffMarketLink"
        >
          Buff
          <span class="spb--text-green">
            market
          </span>
        </a>
      </div>
      <slot name="modal-statistics" />
      <div
        v-if="item.inspect_url"
        class="spb-item__stat spb--cursor-pointer"
        @click="copyToClipboard(item.inspect_url)"
      >
        Inspect
        <span class="spb--text-green">link</span>
      </div>
    </div>
  </div>
</template>

<script>
import { copyToClipboard } from '@/utils'
import { significantProperties, isFloatProfitable } from '@/resources/marketItem'
import { steamMarket, buff163 } from '@/config'

export default {
  name: 'BaseItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      significantProperties,
      steamMarket,
      displayStatistics: this.$store.getters['app/config']('displayItemStatistics')
    }
  },
  computed: {
    existingSignificantProperties() {
      return Object.keys(this.significantProperties).filter(key => this.item[key])
    },
    buffMarketLink() {
      return this.item._buff_good_id
        ? buff163.URL + '/goods/' + this.item._buff_good_id
        : buff163.URL + '/market/csgo#search=' + this.item.steam_market_hash_name
    },
    targetMarket() {
      return this.$store.getters['app/config']('targetMarket')
    },
    discountText() {
      let text = `${this.item.discount}%`

      const targetMarketDiscount = this.item[`_${this.targetMarket}_discount`]

      if (targetMarketDiscount != null) {
        text = `${targetMarketDiscount}% | ` + text
      }

      return text
    }
  },
  methods: {
    copyToClipboard,
    isFloatProfitable
  }
}
</script>

<style>
.spb-item {
  height: 60px;
  width: 100%;
}

.spb-item__row {
  margin: 8px 0;
  background-color: var(--secondary-background-color);
  font-weight: 100;
  font-size: 14px;
}

.spb-item__column {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 4px;
}

.spb-item__name {
  width: 100%;
  display: flex;
  align-items: center;
}

.spb-item__name img {
  padding-right: 10px;
  height: 50px;
}

.spb-item__stickers {
  padding: 4px;
}

.spb-item__sticker > img {
  height: 24px;
}

.spb-item__sticker:hover {
  transform: scale(7);
  background: var(--main-background-color);
  border-radius: 1px;
  box-shadow: 0 0 70px rgb(0 0 0 / 60%);
  z-index: 1;
}

.spb-item__sticker:hover::after {
  content: attr(data-spb-sticker-name) "\A" attr(data-spb-sticker-price);
  white-space: pre-wrap;
  display: block;
  font-size: 2px;
  width: 100%;
  text-align: center;
  padding: 1px;
}

.spb-item__price {
  min-width: 150px;
}

.spb-item__price sup {
  vertical-align: sub;
  font-size: 1em;
  color: var(--alternative-text-color);
}

.spb-item__info {
  min-width: 50px;
}

.spb-item__info--ico {
  background-image: url('chrome-extension://__MSG_@@extension_id__/assets/img/info.svg');
  background-size: 20px;
  min-height: 50px;
  cursor: pointer;
  background-position: center;
  background-repeat: no-repeat;
}

.spb-item__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  padding: 4px;
  background-color: var(--alternative-dark-background-color);
}

.spb-item__stat {
  padding: 4px 10px;
}
</style>