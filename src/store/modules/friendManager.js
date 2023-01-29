import { userFriend } from '@/api/conduit'
import alertType from '@/enums/alertType'

export default {
  namespaced: true,
  state: () => ({
    loaded: null,
    friends: new Map([
      [0,
        {
          shadowpayUserId: '',
          name: 'default'
        }
      ]
    ])
  }),
  getters: {
    friend: state => id => {
      return state.friends.get(id)
    },
    sortedFriends: state => sortAsc => {
      return [...state.friends].sort((a, b) => (a[1].shadowpayUserId - b[1].shadowpayUserId) * (sortAsc ? 1 : -1))
    },
    itemOwner: state => shadowpayUserId => {
      let name = null

      for (const [id, friend] of state.friends) {
        if (id === 0) {
          continue
        }

        if (friend.shadowpayUserId === shadowpayUserId) {
          name = friend.name

          break
        }
      }

      return name
    }
  },
  mutations: {
    setLoaded(state, value) {
      state.loaded = value
    },
    setFriend(state, { id, friend }) {
      state.friends.set(id, friend)
    },
    removeFriend(state, id) {
      state.friends.delete(id)
    }
  },
  actions: {
    async loadFriends({ rootState, commit }) {
      const limit = 50
      let loopLimit = 1

      let loaded = true

      for (let i = 0; i < loopLimit; i++) {
        const { success, data } = await userFriend.all(rootState.session.token, { offset: i * limit, limit })

        if (!success) {
          loaded = false

          break
        }

        for (const friend of data) {
          commit('setFriend', {
            id: friend.id,
            friend: {
              shadowpayUserId: friend.shadowpay_user_id,
              name: friend.name
            }
          })
        }

        if (data.length === limit) {
          loopLimit++
        }
      }

      commit('setLoaded', loaded)
    },
    async addFriend({ rootState, commit, dispatch }, friend) {
      const { success, data, error_message } = await userFriend.create(rootState.session.token, friend)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Friend added'
      }

      if (success) {
        commit('setFriend', {
          id: data.id,
          friend: {
            shadowpayUserId: data.shadowpay_user_id,
            name: data.name
          }
        })
      } else {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      dispatch('app/pushAlert', alert, { root: true })
    },
    async updateFriend({ rootState, commit, dispatch }, friend) {
      const { success, data, error_message } = await userFriend.update(rootState.session.token, friend)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Friend updated'
      }

      if (success) {
        commit('setFriend', {
          id: data.id,
          friend: {
            shadowpayUserId: data.shadowpay_user_id,
            name: data.name
          }
        })
      } else {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      dispatch('app/pushAlert', alert, { root: true })
    },
    async deleteFriend({ rootState, commit, dispatch }, id) {
      const { success, data, error_message } = await userFriend.remove(rootState.session.token, id)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Friend deleted'
      }

      if (success) {
        commit('removeFriend', data.id)
      } else {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      dispatch('app/pushAlert', alert, { root: true })

      return success
    }
  }
}