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
        },
        running(state) {
            let running = false

            state.instances.forEach(instance => {
                if(instance.isRunning) {
                    running = true
                    return
                }
            })

            return running
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
    actions: {
        openBots({rootGetters, commit}) {
            if(!rootGetters['app/config']('openTabsAtStartup')) return

            rootGetters['presetManager/presetIds'].forEach(key => {
                if(key == 0) return

                commit('app/addTab', {
                    isStatic: false,
                    name: 'Bot',
                    symbol: 'B',
                    childComponent: 'Bot',
                    tabMounted: tab => tab.$refs.tabWindow.$refs.childComponent.presetIdModel = key
                }, { root: true })
            })
        }
    }
}