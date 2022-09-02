import { buffMarketItem, steamMarketItem } from '@/api/conduit'

const steamMarketItemsData = new Map()

const buffMarketItemsData = new Map()

const getSteamMarketItemData = async (conduitHashName) => {
  let marketData = steamMarketItemsData.get(conduitHashName)

  if (!marketData) {
    const { success, data } = await steamMarketItem.single(conduitHashName)

    if (success) {
      marketData = {
        price: data.price,
        volume: data.volume
      }

      steamMarketItemsData.set(conduitHashName, marketData)
    }
  }

  return marketData
}

const getBuffMarketItemData = async (hashName) => {
  let marketData = buffMarketItemsData.get(hashName)

  if (!marketData) {
    const { success, data } = await buffMarketItem.single(hashName)

    if (success) {
      marketData = {
        price: data.price,
        volume: data.volume,
        good_id: data.good_id
      }

      buffMarketItemsData.set(hashName, marketData)
    }
  }

  return marketData
}

export {
  getSteamMarketItemData,
  getBuffMarketItemData
}