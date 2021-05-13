import { createStore } from 'vuex'
import appModule from './modules/app.js'
import sessionModule from './modules/session.js'
import botsModule from './modules/bots.js'
import itemModule from './modules/item.js'
import presetManagerModule from './modules/presetManager.js'

export default createStore({
    modules: {
        app: appModule,
        session: sessionModule,
        item: itemModule,
        bots: botsModule,
        presetManager: presetManagerModule
    }
})