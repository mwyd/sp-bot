export default {
    namespaced: true,
    state: () => ({
        presets: new Map([
            [0, 
                {
                    name: "default",
                    deal: 15,
                    dealMargin: 50,
                    minPrice: 1.00,
                    maxPrice: 10.00,
                    toSpend: 20.00,
                    runDelay: 4.0,
                    search: ''
                }
            ]
        ])
    }),
    getters: {
        preset: state => id => {
            return state.presets.get(id)
        },
        presetsId(state) {
            return Array.from(state.presets.keys())
        }
    },
    mutations: {
        setPreset(state, {id, preset}) {
            state.presets.set(id, preset)
        },
        removePreset(state, id) {
            state.presets.delete(id)
        }
    },
    actions: {
        async loadPresets({rootState, commit}) {
            const limit = 50
            let loopLimit = 1

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    action: 'get_presets', 
                    params: {
                        token: rootState.session.token,
                        offset: i * limit,
                        limit: limit
                    }
                }, 
                response => {
                    const {success, data} = response

                    if(success) {
                        for(let preset of data) commit('setPreset', {
                            id: preset.id,
                            preset: preset.preset
                        })

                        if(data.length == limit) loopLimit++
                    }

                    resolve(response)
                }))
            }
        },
        addPreset({rootState, commit}, preset) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'set_preset',
                params: {
                    preset: preset,
                    token: rootState.session.token
                }
            }, 
            response => {
                const {success, data} = response

                if(success) commit('setPreset', {
                    id: data.id,
                    preset: data.preset
                })

                resolve(response)
            }))
        },
        updatePreset({rootState, commit}, {id, preset}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'update_preset',
                params: {
                    id: id,
                    preset: preset,
                    token: rootState.session.token
                }
            }, 
            response => {
                const {success} = response

                if(success) commit('setPreset', {
                    id: id,
                    preset: preset
                })

                resolve(response)
            }))
        },
        deletePreset({rootState, commit}, id) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                action: 'delete_preset',
                params: {
                    id: id,
                    token: rootState.session.token
                }
            }, 
            response => {
                const {success} = response

                if(success) commit('removePreset', id)

                resolve(response)
            }))
        }
    }
}