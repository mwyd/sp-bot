import { checkInstanceTick } from '@/config'

export default {
    namespaced: true,
    state: () => ({
        instances: [],
        runBots: false,
        items: {
            finished: []
        }
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
        openBots({ rootGetters, commit }) {
            if(!rootGetters['app/config']('openTabsAtStartup')) return

            for(let [id] of rootGetters['presetManager/sortedPresets'](true)) {
                if(id == 0) continue

                commit('app/addTab', {
                    isStatic: false,
                    name: 'Bot',
                    symbol: 'B',
                    childComponent: 'Bot',
                    tabMounted: tab => tab.$refs.tabWindow.$refs.childComponent.presetIdModel = id
                }, { root: true })
            }
        },
        async toggleAllInstances({ state, commit }) {
            for(let instance of state.instances) {
                if(instance.isProcessTerminated == state.runBots) continue

                instance.toggleProcess()
            }

            while(state.instances.findIndex(v => v.isProcessTerminated != state.runBots) > -1) {
                await new Promise(resolve => setTimeout(resolve, checkInstanceTick * 1000))
            }

            commit('toggleRunBots')
        }
    }
}