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
                    :data-spb-sticker-name="sticker.name"
                    :data-spb-sticker-price="'$ ' + sticker.steam_price"
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
                <app-input 
                    class="spb-sale-guard-item__dark-input"
                    v-model.number="minPrice"
                    :type="'number'"
                    :validator="value => value >= 0.01 && value <= metadata.maxPrice"
                    :disabled="actionsDisabled"
                    :model-updated="updateTracked"
                >
                </app-input>
            </div>
            <div class="spb-item__column spb-item__max-price">
                <app-input 
                    class="spb-sale-guard-item__dark-input"
                    v-model.number="maxPrice"
                    :type="'number'"
                    :validator="value => value >= metadata.minPrice"
                    :disabled="actionsDisabled"
                    :model-updated="updateTracked"
                >
                </app-input>
            </div>
            <div class="spb-item__column spb-item__watch">
                <button 
                    class="spb-button spb--font-size-small"
                    :class="updateButtonClass"
                    :disabled="actionsDisabled"
                    @click="toggleTracked"
                >
                    {{ metadata.tracked ? 'stop' : 'start' }} 
                </button>
            </div>
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
                <span class="spb--text-green">link</span>
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
import { mapActions } from 'vuex'
import actionMixin from '../mixins/actionMixin.js'
import itemMixin from '../mixins/itemMixin.js'
import AppInput from './ui/AppInput.vue'

export default {
    name: 'SaleGuardItem',
    components: {
        AppInput
    },
    mixins: [actionMixin, itemMixin],
    props: {
        item: Object,
        metadata: Object
    },
    computed: {
        updateButtonClass() {
            return [
                this.metadata.tracked ? 'spb-button--red' : 'spb-button--green'
            ]
        },
        minPrice: {
            get() {
                return this.metadata.minPrice
            },
            set(value) {
                this.$store.commit('saleGuard/setItemMinPrice', {
                    id: this.item.id,
                    minPrice: value
                })
            }
        },
        maxPrice: {
            get() {
                return this.metadata.maxPrice
            },
            set(value) {
                this.$store.commit('saleGuard/setItemMaxPrice', {
                    id: this.item.id,
                    maxPrice: value 
                })
            }
        }
    },
    methods: {
        ...mapActions({
            startTrack: 'saleGuard/startTrack',
            stopTrack: 'saleGuard/stopTrack'
        }),
        updateTracked() {
            if(!this.metadata.tracked) return

            this.disableActions(
                this.$store.dispatch('saleGuard/updateTracked', {
                    id: this.metadata.databaseId,
                    data: {
                        shadowpayOfferId: this.item.id,
                        minPrice: this.metadata.minPrice,
                        maxPrice: this.metadata.maxPrice
                    }
                })
            )
        },
        toggleTracked() {
            this.disableActions(
                this.metadata.tracked 
                    ? this.stopTrack({
                        id: this.metadata.databaseId,
                        showAlert: true
                    }) 
                    : this.startTrack({
                        hashName: this.item.steam_market_hash_name,
                        shadowpayOfferId: this.item.id,
                        minPrice: this.metadata.minPrice,
                        maxPrice: this.metadata.maxPrice
                    })
            )
        }
    }
}
</script>

<style scoped>
.spb-sale-guard-item__dark-input {
    background-color: var(--alternative-dark-background-color);
}
</style>