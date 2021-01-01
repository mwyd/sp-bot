Vue.component('bot-settings', {
    data: function() {
        return {
            runDelay: 4,
            submitKeyCode: 13,
            moneyAlreadySpent: 0,
            csrfCookie: '',
            itemList: [],
            awaitingBuyItems: [],
            pendingBuyItems: [],
            isRunning: false,
            notifiSound: new Audio(chrome.extension.getURL('/assets/audio/Jestem_zrujnowany.mp3')),
            initDate: new Date(),
            apiUrls: {
                getItems: 'https://api.shadowpay.com/api/market/get_items?types=[]&exteriors=[]&rarities=[]&collections=[]&item_subcategories=[]&float=%7B%22from%22:0,%22to%22:1%7D&price_from=0&price_to=12558.58&game=csgo&stickers=[]&count_stickers=[]&short_name=&search=&stack=false&sort=desc&sort_column=price_rate&limit=50&offset=0',
                buyItem: 'https://api.shadowpay.com/api/market/buy_item',
                getBuyHistory: 'https://api.shadowpay.com/en/profile/get_bought_history'
            }
        }
    },
    template: `
        <div class="spb-bot-settings flex">
            <h3 class="spb-header-3">Options</h3>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">% Hot deal</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="0" max="100">
            </div>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">% Deal</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="0" max="100">
                </div>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">% Deal margin</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="-100" max="100">
                </div>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">$ Item min price</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
            </div>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">$ Money to spend</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="0" step="0.01">
            </div>
            <div class="spb-bs__option">
                <span class="spb-bs__desc">s Refresh time</span>
                    <input class="spb-bs__input input--val-ok" type="number" min="0" step="1">
            </div>
            <button class="spb-bs__start-button button--green">START</button>
        </div>
    `
})