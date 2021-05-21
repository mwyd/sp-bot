<template>
    <div class="spb-item__row spb--rounded-small">
        <div class="spb-item spb--flex">
            <div class="spb-item__column spb-item__name">
                <a
                    target="_blank" 
                    class="spb--link"
                    :href="steamItemMarketUrl + item.steam_market_hash_name"
                >
                    <img :src="steamItemImageUrl + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}
                </a>
            </div>
            <div class="spb-item__stickers spb--flex">
                <div class="spb-item__sticker" 
                    v-for="(sticker, index) in item.stickers"
                    :spb-sticker-name="sticker.name"
                    :spb-sticker-price="'$ ' + sticker.steam_price"
                    :key="'item-sticker-' + index"
                >
                    <img :src="steamItemImageUrl + sticker.icon_url">
                </div>
            </div>
            <div class="spb-item__column spb-item__price">
                <span class="spb--font-weight-light">$ {{ parseFloat(item.price_market_usd).toFixed(2) }}
                    <sup>{{ item.discount }}%</sup>
                </span>
            </div>
            <div class="spb-item__column spb-item__min-price">
                <InputField 
                    class="spb-sale-guard-item__dark-input"
                    v-model="minPrice"
                    :type="'number'"
                    :validator="value => value >= 0.01 && value <= item._max_price"
                    :disabled="actionsDisabled"
                >
                </InputField>
            </div>
            <div class="spb-item__column spb-item__max-price">
                <InputField 
                    class="spb-sale-guard-item__dark-input"
                    v-model="maxPrice"
                    :type="'number'"
                    :validator="value => value >= item._min_price"
                    :disabled="actionsDisabled"
                >
                </InputField>
            </div>
            <div class="spb-item__column spb-item__update">
                <button 
                    class="spb-button spb--font-size-small"
                    :class="updateButtonClass"
                    :disabled="actionsDisabled"
                    @click="toggleTracked"
                >
                    {{ metadata.tracked ? 'untrack' : 'track' }} 
                </button>
            </div>
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
                <span :class="interestingFloat(item.floatvalue) ? 'spb--text-highlight' : 'spb--text-green'">
                    {{ item.floatvalue }}
                </span>
            </div>
            <div 
                v-if="blueGem" 
                class="spb-item__stat"
            > 
                Gem
                <span :class="blueGem == 'Gold' ? 'spb--text-highlight' : 'spb--text-blue'">
                    {{ blueGem }}
                </span>
            </div>
            <div 
                v-for="key in existingInterestingProperties"
                class="spb-item__stat" 
                :key="'item.' + key"
            >
                {{ interestingProperties[key].name }} 
                <span class="spb--text-green">{{ interestingProperties[key].unit + ' ' + item[key] }}</span>
            </div>
            <div 
                v-for="key in existingShadowpayStatistics"
                class="spb-item__stat" 
                :key="'item.' + key"
            >
                {{ shadowpayStatistics[key].name }} 
                <span class="spb--text-green">{{ shadowpayStatistics[key].unit + ' ' + mutableProperties[key] }}</span>
            </div>
            <div 
                v-if="item.inspect_url" 
                class="spb-item__stat spb--cursor-pointer"
                @click="copyInspectLink(item.inspect_url)"
            >
                Inspect
                <span class="spb--text-green">
                    <a 
                        target="_blank" 
                        class="spb--link"
                    >Link</a>
                </span>
            </div>
            <div 
                @click="loadShadowpayStatistics" 
                v-if="!hideMoreStatisticsButton" 
                class="spb--cursor-pointer spb-item__stat"
            >
                +
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import DateFormat from 'dateformat'
import InputField from './InputField.vue'

export default {
    name: 'SaleGuardItem',
    components: {
        InputField
    },
    props: {
        item: Object,
        metadata: Object
    },
    data() {
        return {
            displayStatistics: this.$store.getters['app/config']('displayItemStatistics'),
            mutableProperties: {...this.$store.state.item.mutableProperties},
            hideMoreStatisticsButton: false,
            actionsDisabled: false,
            blueGem: null
        }
    },
    computed: {
        ...mapState({
            steamItemMarketUrl: state => state.app.steam.resources.ITEM_SELL_LISTINGS,
            steamItemImageUrl: state => state.app.steam.resources.ITEM_IMAGE,
            interestingProperties: state => state.item.interestingProperites,
            shadowpayStatistics: state => state.item.shadowpayStatistics
        }),
        existingInterestingProperties() {
            return Object.keys(this.interestingProperties).filter(key => this.item[key])
        },
        existingShadowpayStatistics() {
            return Object.keys(this.shadowpayStatistics).filter(key => this.mutableProperties[key])
        },
        updateButtonClass() {
            return [
                this.metadata.tracked ? 'spb-button--red' : 'spb-button--green'
            ]
        },
        minPrice: {
            get() {
                return this.item._min_price
            },
            set(value) {
                this.$store.commit('saleGuard/setItemMinPrice', {
                    id: this.item.id,
                    minPrice: value
                })
                this.updateTracked()
            }
        },
        maxPrice: {
            get() {
                return this.item._max_price
            },
            set(value) {
                this.$store.commit('saleGuard/setItemMaxPrice', {
                    id: this.item.id,
                    maxPrice: value 
                })
                this.updateTracked()
            }
        }
    },
    methods: {
        ...mapActions({
            startTrack: 'saleGuard/startTrack',
            stopTrack: 'saleGuard/stopTrack',
            copyInspectLink: 'item/copyInspectLink'
        }),
        interestingFloat(float) {
            return this.$store.getters['item/interestingFloat'](float)
        },
        toggleDisplayStatistics() {
            this.displayStatistics = !this.displayStatistics
        },
        loadBlueGem() {
            if(this.item._search_steam_hash_name.search('case hardened') < 0) return

            this.$store.dispatch('item/getBlueGem', {
                itemType: this.item.subcategory_name,
                paintSeed: this.item.paintseed
            })
            .then(({success, data}) => {
                if(success && data?.length > 0) this.blueGem = data[0].gem_type
            })
        },
        loadShadowpayStatistics() {
            this.hideMoreStatisticsButton = true

            this.$store.dispatch('item/loadShadowpayStatistics', this.item.steam_market_hash_name)
            .then(({success, data}) => {
                if(!success || data?.length == 0) return

                this.mutableProperties._app_sell_price = (data[0].avg_sell_price * (1 - (data[0].avg_discount / 100))).toFixed(2)
                this.mutableProperties._avg_discount = data[0].avg_discount
                this.mutableProperties._sold = data[0].sold
                this.mutableProperties._last_sold = DateFormat(new Date(data[0].last_sold), 'yyyy-mm-dd H:MM:ss')
            })
        },
        updateTracked() {
            if(!this.metadata.tracked) return

            this.actionsDisabled = true
            this.$store.dispatch('saleGuard/updateTracked', {
                id: this.metadata.databaseId,
                item: this.item
            })
            .then(() => this.actionsDisabled = false)
        },
        toggleTracked() {
            this.actionsDisabled = true

            const promise = this.metadata.tracked ? this.stopTrack(this.metadata.databaseId) : this.startTrack(this.item)
            
            return new Promise(resolve => promise.then(data => {
                this.actionsDisabled = false
                resolve(data)
            }))
        }
    },
    beforeMount() {
        this.loadBlueGem()
    }
}
</script>

<style scoped>
.spb-sale-guard-item__dark-input {
    background-color: var(--alternative-dark-background-color);
}
</style>