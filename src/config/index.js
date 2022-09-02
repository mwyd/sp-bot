const steamMarket = Object.freeze({
  ITEM_SELL_LISTINGS: 'https://steamcommunity.com/market/listings/730/',
  ITEM_IMAGE: 'https://community.cloudflare.steamstatic.com/economy/image/',
  USER_PROFILE: 'https://steamcommunity.com/profiles/'
})

const buff163 = Object.freeze({
  URL: 'https://buff.163.com',
})

const notificationSound = new Audio(chrome.runtime.getURL('/assets/audio/Jestem_zrujnowany.mp3'))

const alertLifeTime = 2.0

const checkInstanceTick = 0.1

const checkBuyHistoryTick = 10

const steamBuffDiscountOffset = 30

export {
  steamMarket,
  buff163,
  notificationSound,
  alertLifeTime,
  checkInstanceTick,
  checkBuyHistoryTick,
  steamBuffDiscountOffset
}