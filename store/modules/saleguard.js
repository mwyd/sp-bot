const gsSaleGuard = {
    state: () => ({
        runSaleGuard: false,
        timeoutId: null,
        saleGuardItems: [],
        itemsOnSale: [],
        updateSaleGuardDelay: 15,
        bidStep: 0.01,
        safeDiscount: 0.99,
        spListItemsUrl: 'https://api.shadowpay.com/api/market/list_items',
        spItemPurchaseStats: 'https://api.shadowpay.com/api/market/get_item_purchase_order_stats',
        spSaveItemPriceUrl: 'https://api.shadowpay.com/api/market/save_item_price' // post -> body [id, price, csrf_token]
    }),
    getters: {
        runSaleGuard(state) {
            return state.runSaleGuard;
        },
        itemsOnSale(state) {
            return state.itemsOnSale;
        }
    },
    mutations: {
        updateSaleGuardItems(state, item) {
            const index = state.saleGuardItems.findIndex(data => data.id == item.id);

            if(index > -1) {
                item._tracked = false;
                state.saleGuardItems.splice(index, 1);
            }
            else {
                item._tracked = true;
                state.saleGuardItems.push({id: item.id, minPrice: item._min_price});
            }

            chrome.storage.sync.set({saleGuardItems: state.saleGuardItems});
        },
        updateSaleGuardItemPrice(state, item) {
            const data = state.saleGuardItems.find(data => data.id == item.id);
            if(data) {
                data.minPrice = item._min_price;
                chrome.storage.sync.set({saleGuardItems: state.saleGuardItems});
            }
            
        },
        loadSaleGuardItems(state, items) {
            if(items) state.saleGuardItems = items;
        } 
    },
    actions: {
        toggleSaleGuard(context) {
            if(context.state.runSaleGuard) {
                context.state.runSaleGuard = false;
                clearTimeout(context.state.timeoutId);
            }
            else {
                context.state.runSaleGuard = true;
                context.dispatch('updateSaleGuard');
            }
        },
        async updateItemPrice(context, item) {
            try {
                const response = await fetch(context.state.spItemPurchaseStats + `?item_id=${item.item_id}`, {credentials: 'include'});
                const data = await response.json();

                if(data.status != 'success') return;

                const currentMinPrice = parseFloat(data.current_min_price);
                const suggestedPrice = parseFloat(data.suggested_price);
                let newPrice = parseFloat(item.price_market);

                if(currentMinPrice > item._min_price) newPrice = currentMinPrice - context.state.bidStep;
                else if(currentMinPrice > suggestedPrice) newPrice = suggestedPrice * context.state.safeDiscount;

                if(item.price_market == newPrice) return;

                fetch(context.state.spSaveItemPriceUrl, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `id=${item.id}&price=${newPrice}&csrf_token=${context.getters.csrfCookie}`
                })
                .then(res => res.json())
                .then(data => {
                    switch(data.status) {
                        case "error":
                            switch(data.error_message) {
                                case 'wrong_token':
                                    context.commit('setCsrfCookie', data.token);
                                    break;
                            }
                            break;
                    }
                })
                .catch(err => spbLog('[ERR] unable to update price\n', err));
            }
            catch(err) {
                spbLog('[ERR] unable to get purchase stats\n', err);
            }
        },
        async updateSaleGuard(context) {
            try {
                const response = await fetch(context.state.spListItemsUrl, {credentials: 'include'});
                const data = await response.json();

                const {status, items} = data;
                if(status != 'success') return;
                let toUpdate = [];

                for(let item of items) {
                    const index = context.state.saleGuardItems.findIndex(data => data.id == item.id);
                    
                    if(index > -1) {
                        item._tracked = true;
                        item._min_price = context.state.saleGuardItems[index].minPrice;
                        toUpdate.push(item);
                    }
                    else {
                        item._tracked = false;
                        item._min_price = parseFloat(item.price_market);
                    }
                }

                context.state.itemsOnSale = items;

                if(context.state.runSaleGuard) {
                    for(let item of toUpdate) {
                        await context.dispatch('updateItemPrice', item);
                        await new Promise(r => setTimeout(r, 1000));
                    }

                    context.state.timeoutId = setTimeout(() => {
                        context.dispatch('updateSaleGuard');
                    }, context.state.updateSaleGuardDelay * 1000);
                }
            }
            catch(err) {
                spbLog('[ERR] unable to load items on sale\n', err);
            }
        }
    }
}