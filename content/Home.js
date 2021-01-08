Vue.component('home', {
    data() {
        return {
            currentView: 'active',
            sortBy: 'realDiscount'
        }
    },
    template: `
        <div class="spb-home">
            <h3 class="spb-header-3">Home</h3>
            <div class="spb-home__views-wrapper">
                <div class="spb-home__views spb-flex">
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
            <div class="spb-home__items-header">
                <div class="spb-home__item-col spb-home__item-name">Item</div>
                <div @click="changeSort" class="spb-home__item-col spb-home__item-price">Price</div>
                <div class="spb-home__item-col spb-home__item-status">Status</div>
                <div class="spb-home__item-col spb-home__item-date">{{ currentView == 'active' ? 'Buy' : 'Date' }}</div>
                <div class="spb-home__item-col spb-home__item-info">Info</div>
            </div>
            <div class="spb-home__items">
                <div v-if="currentView == 'active'" class="spb-home__items-active">
                    <item v-for="item in getToConfirm" 
                        :type="'toConfirm'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item>
                </div>
                <div v-else class="spb-home__items-buy-history">
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
            if(this.sortBy == 'income') return this.$store.getters.getToConfirm.sort((a, b) => b._app_income - a._app_income);
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
            let base = 'spb-home__view';
            return this.currentView == view ? `${base} spb-home__view--active` : base;
        },
        changeView(view) {
            this.currentView = view;
        },
        changeSort() {
            if(this.sortBy == 'income') this.sortBy = 'realDiscount';
            else this.sortBy = 'income';
        }
    }
});