import DateFormat from 'dateformat'

const SPB_LOG = (message, data) => {
    console.log(`[${DateFormat(new Date(), 'H:MM:ss')}] [SP-BOT] ${message}`, data)
}

const roundNumber = (number, decimals = 2) => {
    let places = Math.pow(10, decimals)

    return Math.round(number * places) / places
}

export { SPB_LOG, roundNumber }