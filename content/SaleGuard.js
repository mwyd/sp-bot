Vue.component('saleItem', {
    props: ['item'],
    data() {
        return {
            minPrice: this.item.price_market
        }
    },
    template: `
        <div class="spb-sale-guard__item-row">
            <div class="spb-sale-guard__item spb-flex">
                <div class="spb-sale-guard__item-col spb-sale-guard__item-name">
                    <a target="_blank" :href="'https://steamcommunity.com/market/listings/730/' + item.steam_market_hash_name">
                        <img style="padding-right: 10px;" height="50px" :src="'https://community.cloudflare.steamstatic.com/economy/image/' + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}</a>
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-price">$ {{ item.price_market }}
                    <sup>{{ Math.round(item.discount) }}%</sup>
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-min-price">
                    <input type="number" v-model="minPrice" class="spb-input spb-input--light spb-input--val-ok">
                </div>
                <div class="spb-sale-guard__item-col spb-sale-guard__item-update">
                    <button class="spb-button spb-button--green font-10 spb-button--font-10">Add</button>
                </div>
            </div>
        </div>
    `,
    computed: {}

});

Vue.component('saleGuard', {
    data() {
        return {
            saleItems: [],
            spListItemsUrl: 'https://api.shadowpay.com/api/market/list_items'
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
                <div>
                    <saleItem v-for="(item, index) in itemsSorted" 
                        :item="item" 
                        :key="'sale-item-' + index">
                    </saleItem>
                </div>
            </div>
        </div>
    `,
    computed: {
        itemsSorted() {
            return this.saleItems.sort((a, b) => b.price_market - a.price_market);
        }
    },
    methods: {
        getInventory() {
            fetch(this.spListItemsUrl, {credentials: 'include'})
            .then(res => res.json())
            .then(data => {
                const {status, items} = data;
                if(status) this.saleItems = items;
            })
            .catch(err => spbLog('[ERR] unable to load inventory\n', err));
        }
    },
    beforeMount() {
        this.getInventory();
    }
});