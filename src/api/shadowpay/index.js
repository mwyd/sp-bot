import Cookies from 'js-cookie'
import useItemOnSale from './useItemOnSale'
import useMarket from './useMarket'

const defaults = {
  baseUrl: 'https://api.shadowpay.com',
  credentials: 'include',
  headers: () => ({
    'Accept': 'application/json',
    'x-xsrf-token': Cookies.get('XSRF-TOKEN')
  })
}

const itemOnSale = useItemOnSale(defaults)
const market = useMarket(defaults)

export {
  itemOnSale,
  market
}