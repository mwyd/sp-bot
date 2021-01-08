Vue.component('item', {
    props: ['type', 'item'],
    data() {
        return {
            stats: 'none'
        }
    },
    template: `
        <div :class="'spb-history__row ' + getStateClass">
            <div class="spb-history__item spb-flex">
                <div class="spb-history__col spb-item-name">
                    <a target="_blank" :href="'https://steamcommunity.com/market/listings/730/' + item.steam_market_hash_name">
                        <img style="padding-right: 10px;" height="50px" :src="'https://community.cloudflare.steamstatic.com/economy/image/' + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}</a>
                </div>
                <div class="spb-history__col spb-item-price">$ {{ item.price_market }}
                    <sup>{{ (item._real_discount !== undefined ? item._real_discount + '% | ': '') + item.discount }}%</sup>
                </div>
                <div class="spb-history__col spb-item-status"> {{ item.state }}</div>
                <div class="spb-history__col spb-item-date">
                    <button v-if="type == 'toConfirm'" @click="item._onclick" class="spb-buy-button spb-button--green">Buy now</button>
                    {{ getDate }}
                </div>
                <div @click="showStats" class="spb-history__col spb-item-info spb-info-ico"></div>
            </div>
            <div class="spb-history__item-stats" :style="{display: stats}" >
                <table>
                    <tr>
                        <td>Approximate sell price</td>
                        <td>{{ item._app_sell_price }}</td>
                        <td>Average discount</td>
                        <td>{{ item._avg_discount }}</td>
                    </tr>
                    <tr>
                        <td>Items sold</td>
                        <td>{{ item._sold }}</td>
                        <td>Last sold</td>
                        <td>{{ item._last_sold }}</td>
                    </tr>
                    <tr>
                        <td>Steam price</td>
                        <td>{{ item._steam_price }}</td>
                        <td>Steam volume</td>
                        <td>{{ item._steam_volume }}</td>
                    </tr>
                </table>
            </div>
        </div>
    `,
    computed: {
        getStateClass() {
            return this.type != 'toConfirm' ? `spb-item-state-${this.item.state}` : '';
        },
        getDate() {
            return this.type != 'toConfirm' ? this.item._time_bought : '';
        }
    },
    methods: {
        showStats() {
            if(this.stats == 'none') this.stats = 'block';
            else this.stats = 'none';
        }
    }
});