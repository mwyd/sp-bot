import { user } from '@/api/conduit'
import { syncStorage } from '@/utils'
import alertType from '@/enums/alertType'

export default {
    namespaced: true,
    state: () => ({
        user: null,
        token: null,
        authenticated: false
    }),
    getters: {},
    mutations: {
        setToken(state, token) {
            state.token = token
        },
        setSession(state, data) {
            Object.assign(state, data)
        }
    },
    actions: {
        async loadToken({ commit }) {
            const token = await syncStorage.get('token')

            commit('setToken', token)
        },
        saveToken({ state }) {
            syncStorage.set({
                token: state.token
            })
        },
        async authenticate({ commit, state, dispatch }) {
            const { success, data, error_message } = await user.get(state.token)

            const alert = {
                type: alertType.SUCCESS,
                message: 'Authenticated'
            }

            if(success) {
                commit('setSession', {
                    user: data.name,
                    authenticated: true
                })
            }
            else {
                alert.type = alertType.ERROR,
                alert.message = error_message
            }

            dispatch('app/pushAlert', alert, { root: true })
        }
    }
}