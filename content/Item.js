Vue.component('item', {
    props: ['type', 'item'],
    template: `
        <div class="spb-history-row spb-flex">
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
            </div>
            <div class="spb-history__col spb-item-info spb-info-ico"></div>
            <div v-if="(item.state == 'active' && type != 'toConfirm')" class="spb-item-timebar"></div>
        </div>
    `,
    computed: {
        getDate() {
            return this.type != 'toConfirm' ? getFullDate(new Date(item._time_finished), -2) : '';
        }
    }
});