export default {
    namespaced: true,
    state: () => ({
        loaded: null,
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
        sortedPresets: state => sortAsc => {
            return [...state.presets].sort((a, b) => (a[1].maxPrice - b[1].maxPrice) * (sortAsc ? 1 : -1))
        },
        presetIds(state) {
            return [...state.presets.keys()]
        }
    },
    mutations: {
        setLoaded(state, value) {
            state.loaded = value
        },
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

            let loaded = true

            for(let i = 0; i < loopLimit; i++) {
                await new Promise(resolve => chrome.runtime.sendMessage({
                    service: rootState.app.services.conduit.name,
                    data: {
                        path: `${rootState.app.services.conduit.api.PRESETS}?offset=${i * limit}&limit=${limit}`,
                        config: {
                            headers: {
                                'Authorization': `Bearer ${rootState.session.token}`
                            }
                        }
                    }
                }, 
                response => {
                    const {success, data} = response

                    if(success) {
                        for(let preset of data) {
                            commit('setPreset', {
                                id: preset.id,
                                preset: preset.preset
                            })
                        }

                        if(data.length == limit) loopLimit++
                    }
                    else loaded = false

                    resolve(response)
                }))
            }

            commit('setLoaded', loaded)
        },
        addPreset({rootState, commit, dispatch}, preset) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: rootState.app.services.conduit.api.PRESETS,
                    config: {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: `preset=${JSON.stringify(preset)}`
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Preset created'
                }

                if(success) {
                    commit('setPreset', {
                        id: data.id,
                        preset: data.preset
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        updatePreset({rootState, commit, dispatch}, {id, preset}) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.PRESETS}/${id}`,
                    config: {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: `preset=${JSON.stringify(preset)}`
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Preset updated'
                }

                if(success) {
                    commit('setPreset', {
                        id: data.id,
                        preset: data.preset
                    })
                }
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        },
        deletePreset({rootState, commit, dispatch}, id) {
            return new Promise(resolve => chrome.runtime.sendMessage({
                service: rootState.app.services.conduit.name,
                data: {
                    path: `${rootState.app.services.conduit.api.PRESETS}/${id}`,
                    config: {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${rootState.session.token}`
                        }
                    }
                }
            }, 
            response => {
                const {success, data, error_message} = response

                const alert = {
                    type: rootState.app.alertTypes.SUCCESS,
                    message: 'Preset deleted'
                }

                if(success) commit('removePreset', data.id)
                else {
                    alert.type = rootState.app.alertTypes.ERROR,
                    alert.message = error_message
                }

                dispatch('app/pushAlert', alert, { root: true })
                resolve(response)
            }))
        }
    }
}