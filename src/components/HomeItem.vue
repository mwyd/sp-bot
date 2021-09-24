<template>
    <base-item 
        :item="item"
        :class="stateClass"
    >
        <template #modal-columns>
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
        </template>
        <template #modal-statistics>
            <div class="spb-item__stat spb--cursor-pointer">
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
        </template>
    </base-item>
</template>

<script>
import { mapState } from 'vuex'
import BaseItem from './base/BaseItem.vue'
import DateFormat from 'dateformat'

export default {
    name: 'HomeItem',
    components: {
        BaseItem
    },
    props: {
        type: String,
        item: Object
    },
    emits: ['overBuyButton'],
    data() {
        return {
            friendOwner: null
        }
    },
    computed: {
        ...mapState({
            steamUserProfileUrl: state => state.app.steam.resources.USER_PROFILE,
            itemTypes: state => state.bots.itemTypes
        }),
        stateClass() {
            return [
               this.type != this.itemTypes.TO_CONFIRM ? `spb-item__status--${this.item.state}` : ''
            ]
        },
        timeBought() {
            return DateFormat(this.item._time_bought, 'yyyy-mm-dd H:MM:ss')
        }
    },
    beforeMount() {
        this.loadFriendOwner()
    },
    methods: {
        itemOwnerSteamId(inspectLink) {
            return this.$store.getters['item/itemOwnerSteamId'](inspectLink)
        },
        loadFriendOwner() {
            this.friendOwner = this.$store.getters['friendManager/itemOwner'](this.item.user_id)
        },
        overBuyButton(value) {
            this.$emit('overBuyButton', value)
        }
    }
}
</script>

<style>
.spb-item__status {
    min-width: 90px;
}

.spb-item__date {
    min-width: 150px;
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