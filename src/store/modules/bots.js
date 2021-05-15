export default {
    namespaced: true,
    state: () => ({
        instances: [],
        runBots: false,
        runBotsDelay: 4 * 1000,
        items: {
            finished: []
        },
        itemTypes: Object.freeze({
            TO_CONFIRM: 'toConfirm',
            PENDING: 'pending'
        })
    }),
    getters: {
        items: state => type => {
            let merged = []
            state.instances.forEach(instance => merged.push(...instance.items[type]))
            return merged.filter((item, index, array) => array.findIndex(_item => _item.id == item.id) == index) 
        }
    },
    mutations: {
        toggleRunBots(state) {
            state.runBots = !state.runBots
        },
        addBot(state, instance) {
            state.instances.push(instance)
        },
        closeBot(state, id) {
            state.instances.splice(state.instances.findIndex(instance => instance.id == id), 1)
        }
    },
    actions: {}
}