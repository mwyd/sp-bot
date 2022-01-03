import useItemOnSale from './useItemOnSale'
import useMarket from './useMarket'

const defaults = {
    baseUrl: 'https://api.shadowpay.com',
    credentials: 'include',
    headers: {
        'Accept': 'application/json'
    }
}

const itemOnSale = useItemOnSale(defaults)
const market = useMarket(defaults)

export {
    itemOnSale,
    market
}