Vue.component('home', {
    template: `
        <div class="spb-home">
            <h3 class="spb-header-3">Buy history</h3>
            <div class="spb-history__header flex">
                <div class="spb-history__col spb-item-name">Item</div>
                <div class="spb-history__col spb-item-price">Price</div>
                <div class="spb-history__col spb-item-status">Status</div>
                <div class="spb-history__col spb-item-date">Date</div>
                <div class="spb-history__col spb-item-info">Info</div>
            </div>
            <div class="spb-history flex">
                <div class="spb-history__awaiting">
                    <item v-for="item in getToConfirm" 
                        :type="'toConfirm'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item>
                </div>
                <div class="spb-history__active">
                    <item v-for="item in getActive" 
                        :type="'active'" 
                        :item="item" 
                        :key="'item-' + item.id">
                    </item> 
                </div>
                <div class="spb-history__finished">
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
            return this.$store.getters.getToConfirm;
        },
        getActive() {
            return this.$store.getters.getActive;
        },
        getFinished() {
            return this.$store.getters.getFinished;
        }
    }
});