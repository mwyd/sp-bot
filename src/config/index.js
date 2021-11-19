const steamMarket = Object.freeze({
    ITEM_SELL_LISTINGS: 'https://steamcommunity.com/market/listings/730/',
    ITEM_IMAGE: 'https://community.cloudflare.steamstatic.com/economy/image/',
    USER_PROFILE: 'https://steamcommunity.com/profiles/'
})

const csgoGallery = Object.freeze({
    SCREENSHOT: 'https://csgo.gallery/'
})

const notificationSound = new Audio(chrome.runtime.getURL('/assets/audio/Jestem_zrujnowany.mp3'))

const alertLifeTime = 2.0

const checkInstanceTick = 0.1

export {
    steamMarket,
    csgoGallery,
    notificationSound,
    alertLifeTime,
    checkInstanceTick
}