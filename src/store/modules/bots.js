export default {
    namespaced: true,
    state: () => ({
        instances: [],
        runBots: false,
        items: {
            finished: []
        },
        itemTypes: Object.freeze({
            TO_CONFIRM: 'toConfirm',
            PENDING: 'pending',
            FINISHED: 'finished'
        })
    }),
    getters: {
        items: state => type => {
            const merged = new Map()

            state.instances.forEach(instance => {
                instance.items[type].forEach(item => merged.set(item.id, item))
            })

            return [...merged.values()]
        },
        itemsCount: state => type => {
            let count = 0

            state.instances.forEach(instance => {
                count += instance.items[type].size
            })

            return count
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

            rootGetters['presetManager/sortedPresets'](true).forEach(([id]) => {
                if(id == 0) return

                commit('app/addTab', {
                    isStatic: false,
                    name: 'Bot',
                    symbol: 'B',
                    childComponent: 'Bot',
                    tabMounted: tab => tab.$refs.tabWindow.$refs.childComponent.presetIdModel = id
                }, { root: true })
            })
        },
        async toggleAllInstances({state, commit}) {
            for(let instance of state.instances) {
                if(instance.isProcessTerminated == state.runBots) continue

                instance.toggleProcess()
            }

            while(state.instances.findIndex(v => v.isProcessTerminated != state.runBots) > -1) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            commit('toggleRunBots')
        }
    }
}