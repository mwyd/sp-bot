import { createApp } from 'vue'
import App from './App.vue'
import { initRoot } from './setup.js'
import store from './store/index.js'
import './assets/css/main.css'

const app = createApp(App)
app.use(store)
app.mount(initRoot())
