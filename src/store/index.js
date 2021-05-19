import { createStore } from 'vuex'
import appModule from './modules/app.js'
import sessionModule from './modules/session.js'
import botsModule from './modules/bots.js'
import itemModule from './modules/item.js'
import saleGuardModule from './modules/saleGuard.js'
import presetManagerModule from './modules/presetManager.js'
import friendManagerModule from './modules/friendManager.js'

export default createStore({
    modules: {
        app: appModule,
        session: sessionModule,
        item: itemModule,
        bots: botsModule,
        saleGuard: saleGuardModule,
        presetManager: presetManagerModule,
        friendManager: friendManagerModule
    }
})