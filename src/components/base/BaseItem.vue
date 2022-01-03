<template>
    <div class="spb-item__row spb--rounded-small">
        <div class="spb-item spb--flex">
            <div class="spb-item__column spb-item__name">
                <a
                    target="_blank" 
                    class="spb--link"
                    :href="steamMarket.ITEM_SELL_LISTINGS + item.steam_market_hash_name"
                >
                    <img :src="steamMarket.ITEM_IMAGE + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}
                </a>
            </div>
            <div class="spb-item__stickers spb--flex">
                <div class="spb-item__sticker" 
                    v-for="(sticker, index) in item.stickers"
                    :data-spb-sticker-name="sticker.name"
                    :data-spb-sticker-price="'$ ' + sticker.steam_price"
                    :key="'item-sticker-' + index"
                >
                    <img :src="steamMarket.ITEM_IMAGE + sticker.icon_url">
                </div>
            </div>
            <div class="spb-item__column spb-item__price">
                <span class="spb--font-weight-light">$ {{ item.price_market_usd.toFixed(2) }}
                    <sup>{{ (item._real_discount != null ? item._real_discount + '% | ': '') + item.discount }}%</sup>
                </span>
            </div>
            <slot name="modal-columns"></slot>
            <div 
                class="spb-item__column spb-item__info spb-item__info--ico"
                @click="toggleDisplayStatistics"
            ></div>
        </div>
        <div 
            class="spb-item__stats spb--rounded-small" 
            v-show="displayStatistics"
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
                class="spb-item__stat" 
                :key="'item.' + key"
            >
                {{ significantProperties[key].name }} 
                <span class="spb--text-green">{{ significantProperties[key].unit + ' ' + item[key] }}</span>
            </div>
            <slot name="modal-statistics"></slot>
            <div 
                class="spb-item__stat spb--cursor-pointer"
                @click="copyToClipboard(item.inspect_url)"
            >
                Inspect
                <span class="spb--text-green">link</span>
            </div>
            <div class="spb-item__stat spb--cursor-pointer">
                <a 
                    target="_blank" 
                    class="spb--link"
                    :href="csgoGallery.SCREENSHOT + item.inspect_url"
                > 
                    Screenshot
                    <span class="spb--text-green">
                        cs.deals
                    </span>
                </a>
            </div>
            <div class="spb-item__stat spb--cursor-pointer">
                <a 
                    target="_blank" 
                    class="spb--link"
                    :href="buff163.MARKET + '#search=' + item.steam_market_hash_name"
                > 
                    Buff.163
                    <span class="spb--text-green">
                        market
                    </span>
                </a>
            </div>
            <div 
                v-for="key in existingShadowpayStatistics"
                class="spb-item__stat" 
                :key="'item.' + key"
            >
                {{ shadowpayStatistics[key].name }} 
                <span class="spb--text-green">{{ shadowpayStatistics[key].unit + ' ' + mutableShadowpayStatistics[key] }}</span>
            </div>
            <div 
                v-if="!hideMoreStatisticsButton"
                class="spb--cursor-pointer spb-item__stat"
                @click="loadShadowpayStatistics"  
            >
                +
            </div>
        </div>
    </div>
</template>

<script>
import { copyToClipboard } from '../../utils'
import { significantProperties, shadowpayStatistics, isFloatProfitable } from '../../resources/marketItem'
import { shadowpaySoldItem } from '../../api/conduit'
import { steamMarket, csgoGallery, buff163 } from '../../config'

export default {
    name: 'Item',
    props: {
        item: Object
    },
    data() {
        return {
            significantProperties,
            shadowpayStatistics,
            steamMarket,
            csgoGallery,
            buff163,
            mutableShadowpayStatistics: {},
            displayStatistics: this.$store.getters['app/config']('displayItemStatistics'),
            hideMoreStatisticsButton: false
        }
    },
    computed: {
        existingSignificantProperties() {
            return Object.keys(this.significantProperties).filter(key => this.item[key])
        },
        existingShadowpayStatistics() {
            return Object.keys(this.shadowpayStatistics).filter(key => this.mutableShadowpayStatistics[key])
        }
    },
    methods: {
        copyToClipboard,
        isFloatProfitable,
        toggleDisplayStatistics() {
            this.displayStatistics = !this.displayStatistics
        },
        loadShadowpayStatistics() {
            this.hideMoreStatisticsButton = true

            shadowpaySoldItem.get(this.item._conduit_hash_name)
                .then(({ success, data }) => {
                    if(!success || data?.length == 0) return

                    Object.entries(data[0]).forEach(([k, v]) => {
                        this.mutableShadowpayStatistics['_' + k] = v
                    })

                    this.mutableShadowpayStatistics._app_sell_price = (data[0].avg_suggested_price * (1 - (data[0].avg_discount / 100))).toFixed(2)
                })
        }
    }
}
</script>

<style>
.spb-item {
    height: 60px;
    width: 100%;
}

.spb-item__row {
    margin: 8px 0px;
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