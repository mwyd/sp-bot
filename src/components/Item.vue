<template>
    <div 
        class="spb-item__row spb--rounded-small" 
        :class="stateClass"
    >
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
                <span class="spb--font-weight-light">$ {{ item.price_market_usd.toFixed(2) }}
                    <sup>{{ (item._real_discount ? item._real_discount + '% | ': '') + item.discount }}%</sup>
                </span>
            </div>
            <div class="spb-item__column spb-item__status"> {{ item.state }}</div>
            <div class="spb-item__column spb-item__date">
                <button 
                    class="spb-button spb--font-size-small spb-button--green"
                    v-if="type == itemTypes.TO_CONFIRM" 
                    @click="item._onclick" 
                    @mouseenter="overBuyButton(true)" 
                    @mouseleave="overBuyButton(false)" 
                >
                    Buy now
                </button>
                <span v-else>{{ timeBought }}</span>
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
                v-if="item.inspect_url" 
                class="spb-item__stat spb--cursor-pointer"
            >
                <a 
                    target="_blank" 
                    class="spb--link"
                    :href="steamUserProfileUrl + itemOwnerSteamId(item.inspect_url)"
                > 
                    {{ friendOwner ? friendOwner + "'s" : "Owner's" }}
                    <span class="spb--text-green">
                        steam
                    </span>
                </a>
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
                v-for="key in existingShadowpayStatistics"
                class="spb-item__stat" 
                :key="'item.' + key"
            >
                {{ shadowpayStatistics[key].name }} 
                <span class="spb--text-green">{{ shadowpayStatistics[key].unit + ' ' + mutableProperties[key] }}</span>
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
import DateFormat from 'dateformat'
import { mapState, mapActions } from 'vuex'

export default {
    name: 'Item',
    props: {
        type: String,
        item: Object
    },
    emits: ['overBuyButton'],
    data() {
        return {
            displayStatistics: this.$store.getters['app/config']('displayItemStatistics'),
            mutableProperties: {...this.$store.state.item.mutableProperties},
            hideMoreStatisticsButton: false,
            blueGem: null,
            friendOwner: null
        }
    },
    computed: {
        ...mapState({
            steamItemMarketUrl: state => state.app.steam.resources.ITEM_SELL_LISTINGS,
            steamItemImageUrl: state => state.app.steam.resources.ITEM_IMAGE,
            steamUserProfileUrl: state => state.app.steam.resources.USER_PROFILE,
            interestingProperties: state => state.item.interestingProperites,
            shadowpayStatistics: state => state.item.shadowpayStatistics,
            itemTypes: state => state.bots.itemTypes,
            alertTypes: state => state.app.alertTypes
        }),
        stateClass() {
            return [
               this.type != this.itemTypes.TO_CONFIRM ? `spb-item__status--${this.item.state}` : ''
            ]
        },
        timeBought() {
            return DateFormat(this.item._time_bought, 'yyyy-mm-dd H:MM:ss')
        },
        existingInterestingProperties() {
            return Object.keys(this.interestingProperties).filter(key => this.item[key])
        },
        existingShadowpayStatistics() {
            return Object.keys(this.shadowpayStatistics).filter(key => this.mutableProperties[key])
        }
    },
    methods: {
        ...mapActions({
            updateAlerts: 'app/updateAlerts',
            copyInspectLink: 'item/copyInspectLink'
        }),
        interestingFloat(float) {
            return this.$store.getters['item/interestingFloat'](float)
        },
        itemOwnerSteamId(inspectLink) {
            return this.$store.getters['item/itemOwnerSteamId'](inspectLink)
        },
        loadFriendOwner() {
            this.friendOwner = this.$store.getters['friendManager/itemOwner'](this.item.user_id)
        },
        toggleDisplayStatistics() {
            this.displayStatistics = !this.displayStatistics
        },
        overBuyButton(value) {
            this.$emit('overBuyButton', value)
        },
        loadBlueGem() {
            if(this.item._search_steam_hash_name.search('case hardened') < 0) return

            this.$store.dispatch('item/getBlueGem', {
                itemType: this.item.subcategory_name,
                paintSeed: this.item.paintseed
            })
            .then(({success, data}) => {
                if(success && data?.length > 0) {
                    this.blueGem = data[0].gem_type
                    this.updateAlerts({
                        type: this.alertTypes.INFO,
                        message: `${this.blueGem} Gem ${this.item.steam_market_hash_name}`
                    })
                }
            })
        },
        loadShadowpayStatistics() {
            this.hideMoreStatisticsButton = true

            this.$store.dispatch('item/loadShadowpayStatistics', this.item.steam_market_hash_name)
            .then(({success, data}) => {
                if(!success || data?.length == 0) return

                this.mutableProperties._app_sell_price = (data[0].avg_suggested_price * (1 - (data[0].avg_discount / 100))).toFixed(2)
                this.mutableProperties._avg_discount = data[0].avg_discount
                this.mutableProperties._sold = data[0].sold
                this.mutableProperties._last_sold = data[0].last_sold
            })
        }
    },
    beforeMount() {
        this.loadBlueGem()
        this.loadFriendOwner()
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

.spb-item__min-price, .spb-item__max-price {
    min-width: 120px;
}

.spb-item__min-price > .spb-input, .spb-item__max-price > .spb-input {
    width: 80%;
}

.spb-item__price sup {
    vertical-align: sub;
    font-size: 1em;
    color: var(--alternative-text-color);
}

.spb-item__status {
    min-width: 90px;
}

.spb-item__watch {
    min-width: 80px;
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

.spb-item__date {
    min-width: 150px;
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

.spb-item__status--active {
    border-left: 2px solid var(--active-color);
}

.spb-item__status--cancelled {
    border-left: 2px solid var(--cancelled-color);
}

.spb-item__status--finished {
    border-left: 2px solid var(--accepted-color);
}
</style>