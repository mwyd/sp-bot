Vue.component('home', {
    template: `
        <div class="spb-home">
            <h3 class="spb-header-3">Buy history</h3>
            <div class="spb-history__header flex">
                <div class="spb-history__col spb-item-name">Item</div>
                <div class="spb-history__col spb-item-price">Price</div>
                <div class="spb-history__col spb-item-status">Status</div>
                <div class="spb-history__col spb-item-date">Date</div>
            </div>
            <div class="spb-history flex">
                <div class="spb-history__awaiting"></div>
                <div class="spb-history__active"></div>
                <div class="spb-history__finished"></div>
            </div>
        </div>
    `
})