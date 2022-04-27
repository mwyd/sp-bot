import { steamBuffDiscountOffset } from '@/config'
import targetMarketType from '@/enums/targetMarketType'

export default {
    data() {
        return {
            presetModel: 0,
            preset: { ...this.getPreset(0) }
        }
    },
    computed: {
        dealMargin: {
            get() {
                let dealMargin = this.preset.dealMargin

                if(this.$store.getters['app/config']('targetMarket') == targetMarketType.BUFF) {
                    dealMargin -= steamBuffDiscountOffset 
                }

                return dealMargin
            },
            set(value) {
                let dealMargin = value

                if(this.$store.getters['app/config']('targetMarket') == targetMarketType.BUFF) {
                    dealMargin += steamBuffDiscountOffset 
                }

                this.preset.dealMargin = dealMargin
            }
        }
    },
    watch: {
        presetModel(value) {
            this.preset = { ...this.getPreset(value) }
        }
    },
    methods: {
        sortedPresets(sortAsc = true) {
            return this.$store.getters['presetManager/sortedPresets'](sortAsc)
        },
        getPreset(id) {
            return this.$store.getters['presetManager/preset'](id)
        }
    }
}