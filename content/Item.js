Vue.component('item', {
    props: ['type', 'item'],
    data() {
        return {
            dispalyStats: false
        }
    },
    template: `
        <div :class="'spb-home__item-row ' + getStateClass">
            <div class="spb-home__item spb-flex">
                <div class="spb-home__item-col spb-home__item-name">
                    <a target="_blank" :href="'https://steamcommunity.com/market/listings/730/' + item.steam_market_hash_name">
                        <img style="padding-right: 10px;" height="50px" :src="'https://community.cloudflare.steamstatic.com/economy/image/' + item.steam_icon_url_large">
                    {{ item.steam_market_hash_name }}</a>
                </div>
                <div class="spb-home__item-col spb-home__item-price">$ {{ item.price_market }}
                    <sup>{{ (item._real_discount !== undefined ? item._real_discount + '% | ': '') + item.discount }}%</sup>
                </div>
                <div class="spb-home__item-col spb-home__item-status"> {{ item.state }}</div>
                <div class="spb-home__item-col spb-home__item-date">
                    <button v-if="type == 'toConfirm'" @click="item._onclick" class="spb-button spb-button--font-10 spb-button--green">Buy now</button>
                    {{ getDate }}
                </div>
                <div @click="showStats" class="spb-home__item-col spb-home__item-info spb-home__item-info-ico"></div>
            </div>
            <div :class="getStatsClass">
                <div v-if="item._app_income" class="spb-home__item-stat">
                    Income <span>$ {{ item._app_income }}</span>
                </div>
                <div v-if="item._app_income_percentage" class="spb-home__item-stat">
                    Income <span>% {{ item._app_income_percentage }}</span>
                </div>
                <div v-if="item._steam_price" class="spb-home__item-stat">
                    Steam price <span>$ {{ item._steam_price }}</span>
                </div>
                <div v-if="item._steam_volume" class="spb-home__item-stat">
                    Steam volume <span>{{ item._steam_volume }}</span>
                </div>
                <div v-if="item._app_sell_price" class="spb-home__item-stat">
                    Approximate sell price <span>$ {{ item._app_sell_price }}</span>
                </div>
                <div v-if="item._avg_discount" class="spb-home__item-stat">
                    Average discount <span>% {{ item._avg_discount }}</span>
                </div>
                <div v-if="item._sold" class="spb-home__item-stat">
                    Items sold <span>{{ item._sold }}</span>
                </div>
                <div v-if="item._last_sold" class="spb-home__item-stat">
                    Last sold <span>{{ item._last_sold }}</span>
                </div>
            </div>
        </div>
    `,
    computed: {
        getStateClass() {
            return this.type != 'toConfirm' ? `spb-home__item--${this.item.state}` : '';
        },
        getStatsClass() {
            let base = 'spb-home__item-stats';
            return this.dispalyStats ? base : `${base} spb--hidden`;
        },
        getDate() {
            return this.type != 'toConfirm' ? this.item._time_bought : '';
        }
    },
    methods: {
        showStats() {
            this.dispalyStats = !this.dispalyStats;
        }
    }
});