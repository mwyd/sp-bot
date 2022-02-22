import { createApp } from 'vue'
import { initRoot } from './setup'
import App from './App'
import store from './store'
import './assets/css/main.css'
import { SPB_LOG } from './utils'

try {
    const root = initRoot()

    const app = createApp(App)
    app.use(store)
    app.mount(root)
}
catch(err) {
    SPB_LOG(err)
}
