import itemSortType from '@/enums/itemSortType'
import { itemSortBy } from '@/resources/marketItem'

export default {
  data() {
    return {
      itemSortBy,
      search: '',
      sortModel: itemSortType.SHADOWPAY_DISCOUNT,
      sortDirAsc: false
    }
  },
  computed: {
    sortDirClass() {
      return [
        this.sortDirAsc ? 'spb-sort-dir--asc' : 'spb-sort-dir--desc'
      ]
    }
  }
}