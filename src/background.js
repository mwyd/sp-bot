import apiService from '@/enums/apiService'
import internalAction from '@/enums/internalAction'

const setBuyCounter = counter => {
  chrome.storage.local.set({ buyCounter: counter })
}

const getBuyCounter = callback => {
  chrome.storage.local.get(['buyCounter'], ({ buyCounter }) => callback(buyCounter))
}

chrome.runtime.onStartup.addListener(() => setBuyCounter(0))

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.origin !== 'https://shadowpay.com') {
    return false
  }

  const { service, data } = request

  switch (service) {
    case apiService.INTERNAL:
      switch (data.action) {
        case internalAction.INCREMENT_BUY_COUNTER:
          getBuyCounter(buyCounter => {
            buyCounter++

            setBuyCounter(buyCounter)
            sendResponse({ data: buyCounter })
          })
          break

        case internalAction.GET_BUY_COUNTER:
          getBuyCounter(buyCounter => sendResponse({ data: buyCounter }))
          break
      }
      break

    case apiService.CONDUIT:
      fetch(data.path, data.config ?? {})
        .then(res => res.json())
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error_message: err?.message ?? 'Conduit error' }))
      break

    case apiService.CSGO_FLOAT:
      fetch(data.path, data.config ?? {})
        .then(res => res.json())
        .then(data => sendResponse({ success: true, data: data }))
        .catch(err => sendResponse({ success: false, error_message: err?.message ?? 'Csgo float error' }))
      break
  }

  return true
})