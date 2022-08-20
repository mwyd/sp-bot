import DateFormat from 'dateformat'
import alertType from '@/enums/alertType'
import store from '@/store'

const SPB_LOG = (message, data) => {
  console.log(`[${DateFormat(new Date(), 'H:MM:ss')}] [SP-BOT] ${message}`, data)
}

const round = (number, decimals = 2) => {
  let places = Math.pow(10, decimals)

  return Math.round(number * places) / places
}

const copyToClipboard = async (data) => {
  const alert = {
    type: alertType.SUCCESS,
    message: 'Copied'
  }

  try {
    await navigator.clipboard.writeText(data)
  } catch (err) {
    alert.type = alertType.ERROR
    alert.message = 'Copy error'
  }

  store.dispatch('app/pushAlert', alert, { root: true })
}

const fetchBackground = message => new Promise(resolve => chrome.runtime.sendMessage(message, resolve))

const fetchJson = async (url, config = {}) => {
  const response = await fetch(url, config)
  const data = await response.json()

  return data
}

const syncStorage = {
  set: data => chrome.storage.sync.set(data),
  get: key => new Promise(resolve => chrome.storage.sync.get([key], data => resolve(data[key])))
}

const calculateDiscount = (a, b, round = true) => {
  const discount = (1 - (a / b)) * 100

  return round ? Math.round(discount) : discount
}

export {
  SPB_LOG,
  round,
  copyToClipboard,
  fetchBackground,
  fetchJson,
  syncStorage,
  calculateDiscount
}