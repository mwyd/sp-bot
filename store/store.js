Vue.use(Vuex);

const gStore = new Vuex.Store({
    modules: {
        session: gsSession,
        ws: gsWs,
        app: gsApp,
        bots: gsBots
    }
});