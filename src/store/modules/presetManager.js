export default {
    namespaced: true,
    state: () => ({
        presets: [{
            id: 0,
            name: "default",
            deal: 15,
            dealMargin: 50,
            minPrice: 1.00,
            maxPrice: 10.00,
            toSpend: 20.00,
            runDelay: 4.0,
            search: '',
        }]
    }),
    getters: {},
    mutations: {},
    actions: {}
}