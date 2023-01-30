import DateFormat from 'dateformat'
import { checkInstanceTick, checkBuyHistoryTick, notificationSound } from '@/config'
import { market } from '@/api/shadowpay'
import { SPB_LOG, shadowpayDate } from '@/utils'
import alertType from '@/enums/alertType'

export default {
  namespaced: true,
  state: () => ({
    instances: [],
    runBots: false,
    items: {
      pending: new Map(),
      finished: []
    },
    historyProcess: {
      isRunning: false,
      timestamp: null
    }
  }),
  getters: {
    toConfirmItems: state => {
      const merged = new Map()

      for (const instance of state.instances) {
        for (const [id, item] of instance.items.toConfirm) {
          merged.set(id, item)
        }
      }

      return [...merged.values()]
    },
    pendingItems: state => {
      return [...state.items.pending.values()]
    }
  },
  mutations: {
    toggleHistoryProcess(state) {
      state.historyProcess.isRunning = !state.historyProcess.isRunning
    },
    regenerateHistoryProcessTimestamp(state) {
      state.historyProcess.timestamp = shadowpayDate()
    },
    setPendingItem(state, item) {
      state.items.pending.set(item.id, item)
    },
    deletePendingItem(state, id) {
      state.items.pending.delete(id)
    },
    addFinishedItem(state, item) {
      state.items.finished.push(item)
    },
    toggleRunBots(state) {
      state.runBots = !state.runBots
    },
    addBot(state, instance) {
      state.instances.push(instance)
    },
    closeBot(state, id) {
      state.instances.splice(state.instances.findIndex(instance => instance.id === id), 1)
    }
  },
  actions: {
    openBots({ rootGetters, commit }) {
      if (!rootGetters['app/config']('openTabsAtStartup')) {
        return
      }

      for (const [id] of rootGetters['presetManager/sortedPresets'](true)) {
        if (id === 0) {
          continue
        }

        commit('app/addTab', {
          isStatic: false,
          symbol: 'B',
          childComponent: 'BotTab',
          tabMounted: tab => tab.$refs.tabWindow.$refs.childComponent.presetModel = id
        }, { root: true })
      }
    },
    async toggleAllInstances({ state, commit }) {
      for (let i = 0; i < state.instances.length; i++) {
        const instance = state.instances[i]

        if (instance.isProcessTerminated === state.runBots) {
          continue
        }

        setTimeout(instance.toggleProcess, i * checkInstanceTick * 1000)
      }

      while (state.instances.findIndex(v => v.isProcessTerminated !== state.runBots) > -1) {
        await new Promise(resolve => setTimeout(resolve, checkInstanceTick * 1000))
      }

      commit('toggleRunBots')
    },
    async updatePendingItems({ state, commit, dispatch }) {
      try {
        const { items = [] } = await market.getBuyHistory({
          page: 1,
          limit: 500,
          sort_column: 'time_finished',
          sort_dir: 'desc',
          custom_id: '',
          date_start: DateFormat(state.historyProcess.timestamp, 'yyyy-mm-dd H:MM:ss'),
          date_end: '',
          state: 'all'
        })

        for (const [id, item] of state.items.pending) {
          const transaction = items.find(transaction => transaction.id === item._transaction_id)

          if (!transaction) {
            continue
          }

          if (['cancelled', 'finished'].indexOf(transaction.state) > -1) {
            item.state = transaction.state

            commit('deletePendingItem', id)
            commit('addFinishedItem', item)
          }
        }
      } catch (err) {
        SPB_LOG('\n', new Error(err))
      }

      if (state.items.pending.size === 0) {
        commit('toggleHistoryProcess')

        return
      }

      setTimeout(() => dispatch('updatePendingItems'), checkBuyHistoryTick * 1000)
    },
    async buyItem({ state, commit, dispatch }, item) {
      if (state.items.pending.has(item.id)) {
        return
      }

      item._transaction_id = null
      item._time_bought = Date.now()

      commit('setPendingItem', item)

      try {
        const data = await market.buy(item.id, item.price_market_usd)

        const { status, id, error_message } = data

        const alert = {}

        if (status === 'success') {
          item._transaction_id = id

          alert.type = alertType.SUCCESS
          alert.message = 'Successful purchase'

          if (state.historyProcess.isRunning === false) {
            commit('regenerateHistoryProcessTimestamp')
            commit('toggleHistoryProcess')

            dispatch('updatePendingItems')
          }

          notificationSound.play()
        } else {
          alert.type = alertType.ERROR
          alert.message = error_message || 'Purchase failed'

          commit('deletePendingItem', item.id)
        }

        dispatch('app/pushAlert', alert, { root: true })

        SPB_LOG('Buy info', { ...data, _item: item })
      } catch (err) {
        commit('deletePendingItem', item.id)

        SPB_LOG('\n', new Error(err))
      }
    }
  }
}