Vue.component('home', {
    data() {
        return {
            currentView: 'active'
        }
    },
    template: `
        <div class="spb-home">
            <h3 class="spb-header-3">Home</h3>
            <div class="spb-home__state--wrapper">
                <div class="spb-home__state spb-flex">
                    <div 
                        @click="changeView('active')" 
                        :class="getStateClass('active')">
                        Active
                    </div>
                    <div 
                        @click="changeView('buyHistory')" 
                        :class="getStateClass('buyHistory')">
                        Buy history
                    </div>
                </div>
            </div>
            <div class="spb-history__header flex">
                <div class="spb-history__col spb-item-name">Item</div>
                <div class="spb-history__col spb-item-price">Price</div>
                <div class="spb-history__col spb-item-status">Status</div>
                <div class="spb-history__col spb-item-date">{{ currentView == 'active' ? 'Buy' : 'Date' }}</div>
                <div class="spb-history__col spb-item-info">Info</div>
            </div>
            <div class="spb-history flex">
                <div v-if="currentView == 'active'" class="spb-history__active">
                    <item v-for="item in getToConfirm" 
                        :type="'toConfirm'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item>
                </div>
                <div v-else class="spb-history__buy-history">
                    <item v-for="item in getActive" 
                        :type="'active'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item> 
                    <item v-for="item in getFinished" 
                        :type="'finished'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item> 
                </div>
            </div>
        </div>
    `,
    computed: {
        getToConfirm() {
            return this.$store.getters.getToConfirm.sort((a, b) => b._real_discount - a._real_discount);
        },
        getActive() {
            return this.$store.getters.getActive;
        },
        getFinished() {
            return this.$store.getters.getFinished;
        }
    },
    methods: {
        getStateClass(view) {
            let base = 'spb-home__state-child';
            return this.currentView == view ? `${base} spb-home-state--active` : base;
        },
        changeView(view) {
            this.currentView = view;
        }
    }
});