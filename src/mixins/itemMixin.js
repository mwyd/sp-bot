import { mapState, mapActions } from 'vuex'

export default {
    data() {
        return {
            displayStatistics: this.$store.getters['app/config']('displayItemStatistics'),
            mutableProperties: {...this.$store.state.item.mutableProperties},
            hideMoreStatisticsButton: false,
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
        }
    },
    methods: {
        ...mapActions({
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

                this.mutableProperties._app_sell_price = (data[0].avg_suggested_price * (1 - (data[0].avg_discount / 100))).toFixed(2)
                this.mutableProperties._avg_discount = data[0].avg_discount
                this.mutableProperties._sold = data[0].sold
                this.mutableProperties._last_sold = data[0].last_sold
            })
        }
    }
}