Vue.component('home', {
    data() {
        return {
            currentView: 'active',
            sortBy: 'realDiscount',
            items: {
                toConfirm: [],
                active: [],
                finished: []
            },
            frozenToConfirm: false
        }
    },
    template: `
        <div class="spb-home">
            <h3 class="spb-header-3">Home</h3>
            <div class="spb-home__views-wrapper">
                <div class="spb-home__views spb-flex">
                    <div 
                        @click="changeView('active')" 
                        :class="stateClass('active')">
                        Active
                    </div>
                    <div 
                        @click="changeView('buyHistory')" 
                        :class="stateClass('buyHistory')">
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
                    <item v-for="item in toConfirm" 
                        @overbuybtn="freezeToConfirm" 
                        :type="'toConfirm'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item>
                </div>
                <div v-else class="spb-home__items-buy-history">
                    <item v-for="item in active" 
                        :type="'active'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item> 
                    <item v-for="item in finished" 
                        :type="'finished'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item> 
                </div>
            </div>
        </div>
    `,
    computed: {
        toConfirm() {
            if(!this.frozenToConfirm) this.items.toConfirm = this.$store.getters.items('toConfirm');

            this.sortBy == 'income' 
                ? this.items.toConfirm.sort((a, b) => b._app_income - a._app_income) 
                : this.items.toConfirm.sort((a, b) => b._real_discount - a._real_discount);

            this.$store.dispatch('wsSend', {action: 'update', type: 'to_confirm', target: this.items.toConfirm});

            return this.items.toConfirm;
        },
        active() {
            this.items.active = this.$store.getters.items('active');
            this.$store.dispatch('wsSend', {action: 'update', type: 'active', target: this.items.active});

            return this.items.active;
        },
        finished() {
            this.$store.getters.items('finished').forEach(v => {
                if(this.items.finished.findIndex(x => x.id == v.id) == -1) this.items.finished.push(v);
            });
            this.$store.dispatch('wsSend', {action: 'update', type: 'finished', target: this.items.finished});

            return this.items.finished;
        }
    },
    methods: {
        stateClass(view) {
            let base = 'spb-home__view';
            return this.currentView == view ? `${base} spb-home__view--active` : base;
        },
        changeView(view) {
            this.currentView = view;
        },
        changeSort() {
            if(this.sortBy == 'income') this.sortBy = 'realDiscount';
            else this.sortBy = 'income';
        },
        freezeToConfirm(val) {
            this.frozenToConfirm = val;
        }
    }
});