import apiService from '@/enums/apiService'
import useSaleGuardItem from './useSaleGuardItem'
import useUser from './useUser'
import useUserConfig from './useUserConfig'
import useUserFriend from './useUserFriend'
import useUserPreset from './useUserPreset'
import useRarePaintSeedItem from './useRarePaintSeedItem'
import useSteamMarketItem from './useSteamMarketItem'
import useBuffMarketItem from './useBuffMarketItem'

const defaults = {
  baseUrl: 'https://conduit.ddns.net/api/v1',
  service: apiService.CONDUIT
}

const user = useUser(defaults)
const userPreset = useUserPreset(defaults)
const userFriend = useUserFriend(defaults)
const userConfig = useUserConfig(defaults)
const saleGuardItem = useSaleGuardItem(defaults)
const rarePaintSeedItem = useRarePaintSeedItem(defaults)
const steamMarketItem = useSteamMarketItem(defaults)
const buffMarketItem = useBuffMarketItem(defaults)

export {
  user,
  userPreset,
  userFriend,
  userConfig,
  saleGuardItem,
  rarePaintSeedItem,
  steamMarketItem,
  buffMarketItem
}
