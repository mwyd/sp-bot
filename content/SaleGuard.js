Vue.component('saleItem', {
    props: ['item'],
    template: `
        <div class="spb-sale-guard__item-row">
            <div class="spb-sale-guard__item spb-flex">
                <div class="spb-sale-guard__item-col spb-sale-guard__item-name">
                    <a target="_blank" :href="'https://steamcommunity.com/market/listings/730/' + item.steam_market_hash_name">
                        <img style="padding-right: 10px;" height="50px" :src="'https://community.cloudflare.steamstatic.com/economy/image/' + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}</a>
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-price">$ {{ item.steam_price_en + ' → ' + item.price_market }}
                    <sup>{{ Math.round(item.discount) }}%</sup>
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-min-price">
                    <input type="number" 
                        :value="item._min_price.toFixed(2)" 
                        @focusout="inFocusOut"
                        @input="inInput"
                        @keydown.enter="updateMinPrice"
                        class="spb-input spb-input--light spb-input--val-ok">
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-update">
                    <button 
                        @click="$store.commit('updateSaleGuardItems', item)" 
                        :class="updateButtonClass">
                        {{ item._tracked ? 'remove' : 'add' }}
                    </button>
                </div>
            </div>
        </div>
    `,
    computed: {
        updateButtonClass() {
            const base = 'spb-button font-10 spb-button--font-10';
            return this.item._tracked ? `${base} spb-button--red` : `${base} spb-button--green`;
        }
    },
    methods: {
        inFocusOut(e) {
            e.target.value = this.item._min_price.toFixed(2);
            e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok'); 
        },
        inInput(e) {
            this.item._min_price == e.target.value ? e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok') : e.target.classList.replace('spb-input--val-ok', 'spb-input--val-wrong');
        },
        updateMinPrice(e) {
            this.item._min_price = parseFloat(e.target.value);
            this.$store.commit('updateSaleGuardItemPrice', this.item);
            e.target.classList.replace('spb-input--val-wrong', 'spb-input--val-ok');
        },

    }

});

Vue.component('saleGuard', {
    data() {
        return {
            freeze: false,
            items: []
        }
    },
    template: `
        <div class="spb-sale-guard">
            <h3 class="spb-header-3">Sale Guard</h3>
            <div class="spb-sale-guard__items-header">
                <div class="spb-sale-guard__item-col spb-sale-guard__item-name">Item</div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-price">Price</div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-min-price">Min price</div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-update">Update</div>
            </div>
            <div class="spb-sale-guard__items">
                <div @focusin="updateFreeze(true)" @focusout="updateFreeze(false)">
                    <saleItem v-for="item in itemsOnSale" 
                        :item="item" 
                        :key="'sale-item-' + item.id">
                    </saleItem>
                </div>
            </div>
        </div>
    `,
    computed: {
        runSaleGuard() {
            return this.$store.getters.runSaleGuard;
        },
        itemsOnSale() {
            if(!this.freeze) this.items = this.$store.getters.itemsOnSale;
            return this.items;
        }
    },
    watch: {
        runSaleGuard(val) {
            val ? this.$emit('statusupdate', 'running') : this.$emit('statusupdate', 'idle');
        }
    },
    methods: {
        updateFreeze(value) {
            this.freeze = value;
        }
    },
    beforeMount() {
        this.$store.dispatch('updateSaleGuard');
    }
});