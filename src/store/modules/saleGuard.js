import { SPB_LOG, round } from '@/utils'
import { saleGuardItem } from '@/api/conduit'
import { itemOnSale } from '@/api/shadowpay'
import { inspectItem, normalizeMarketItem } from '@/resources/marketItem'
import alertType from '@/enums/alertType'

export default {
  namespaced: true,
  state: () => ({
    loaded: null,
    items: new Map()
  }),
  getters: {
    trackedItems(state) {
      return function* () {
        for (const item of state.items.values()) {
          if (item.metadata.tracked) {
            yield item
          }
        }
      }
    },
    untrackedItems(state) {
      return function* () {
        for (const item of state.items.values()) {
          if (!item.metadata.tracked) {
            yield item
          }
        }
      }
    }
  },
  mutations: {
    setLoaded(state, value) {
      state.loaded = value
    },
    setItems(state, items) {
      state.items = items
    },
    setItemMetadata(state, { id, metadata }) {
      const item = state.items.get(id)

      item.metadata = metadata
    },
    setItemMinPrice(state, { id, minPrice }) {
      const item = state.items.get(id)

      item.metadata.minPrice = minPrice
    },
    setItemMaxPrice(state, { id, maxPrice }) {
      const item = state.items.get(id)

      item.metadata.maxPrice = maxPrice
    },
    setItemMarketPrice(state, { id, price }) {
      const item = state.items.get(id)

      item.item.price_market_usd = price
      item.item.discount = 100 - Math.round(item.item.price_market_usd * 100 / item.item.steam_price_en)
    }
  },
  actions: {
    async startTrack({ rootState, commit, dispatch }, metadata) {
      const { success, data, error_message } = await saleGuardItem.create(rootState.session.token, metadata)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Item added'
      }

      if (success) {
        commit('setItemMetadata', {
          id: data.shadowpay_offer_id,
          metadata: {
            databaseId: data.id,
            tracked: true,
            minPrice: data.min_price,
            maxPrice: data.max_price,
            createdAt: data.created_at
          }
        })
      } else {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      dispatch('app/pushAlert', alert, { root: true })
    },
    async startTrackAll({ getters, dispatch }) {
      for (const { item, metadata } of getters.untrackedItems()) {
        await dispatch('startTrack', {
          shadowpayOfferId: item.id,
          hashName: item._conduit_hash_name,
          minPrice: metadata.minPrice,
          maxPrice: metadata.maxPrice
        })
      }
    },
    async updateTracked({ rootState, dispatch }, item) {
      const { success, error_message } = await saleGuardItem.update(rootState.session.token, item)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Item updated'
      }

      if (!success) {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      dispatch('app/pushAlert', alert, { root: true })
    },
    async stopTrack({ rootState, commit, dispatch }, { id, showAlert = true }) {
      const { success, data, error_message } = await saleGuardItem.remove(rootState.session.token, id)

      const alert = {
        type: alertType.SUCCESS,
        message: 'Item deleted'
      }

      if (success) {
        commit('setItemMetadata', {
          id: data.shadowpay_offer_id,
          metadata: {
            databaseId: null,
            tracked: false,
            minPrice: data.min_price,
            maxPrice: data.max_price,
            createdAt: null
          }
        })
      } else {
        alert.type = alertType.ERROR
        alert.message = error_message
      }

      if (showAlert) {
        dispatch('app/pushAlert', alert, { root: true })
      }
    },
    async stopTrackAll({ getters, dispatch }) {
      for (const { metadata } of getters.trackedItems()) {
        await dispatch('stopTrack', {
          id: metadata.databaseId
        })
      }
    },
    async loadItemsOnSale({ state, rootGetters, commit }) {
      try {
        const { status, items } = await itemOnSale.all()

        if (status !== 'success') {
          return
        }

        const updatedItems = new Map()

        for (const item of items) {
          normalizeMarketItem(item)

          const itemOnSale = state.items.get(item.id)

          if (itemOnSale) {
            updatedItems.set(item.id, {
              item,
              metadata: itemOnSale.metadata
            })

            continue
          }

          const minPrice = item.price_market_usd
          let maxPrice = round(item.steam_price_en * rootGetters['app/config']('saleGuardSafeDiscount'))

          if (maxPrice < minPrice) {
            maxPrice = round(minPrice + rootGetters['app/config']('saleGuardBidStep'))
          }

          updatedItems.set(item.id, {
            item: item,
            metadata: {
              databaseId: null,
              tracked: false,
              minPrice: minPrice,
              maxPrice: maxPrice
            }
          })

          inspectItem(item, false)
        }

        commit('setItems', updatedItems)
      } catch (err) {
        SPB_LOG('Cant load items on sale', err)
      }
    },
    async loadSaleGuardItems({ state, rootState, commit }) {
      const limit = 50
      let loopLimit = 1

      let loaded = true
      const missingItems = []

      for (let i = 0; i < loopLimit; i++) {
        const { success, data } = await saleGuardItem.all(rootState.session.token, { offset: i * limit, limit })

        if (!success) {
          loaded = false

          break
        }

        for (const item of data) {
          if (!state.items.has(item.shadowpay_offer_id)) {
            missingItems.push(item.id)

            continue
          }

          commit('setItemMetadata', {
            id: item.shadowpay_offer_id,
            metadata: {
              databaseId: item.id,
              tracked: true,
              minPrice: item.min_price,
              maxPrice: item.max_price,
              createdAt: item.created_at
            }
          })
        }

        if (data.length === limit) {
          loopLimit++
        }
      }

      for (const id of missingItems) {
        await saleGuardItem.remove(rootState.session.token, id)
      }

      commit('setLoaded', loaded)
    }
  }
}