import { createStore } from 'vuex'
import app from './modules/app'
import session from './modules/session'
import bots from './modules/bots'
import saleGuard from './modules/saleGuard'
import presetManager from './modules/presetManager'
import friendManager from './modules/friendManager'

export default createStore({
    modules: {
        app,
        session,
        bots,
        saleGuard,
        presetManager,
        friendManager
    }
})