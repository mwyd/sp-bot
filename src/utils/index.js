import DateFormat from 'dateformat'

const SPB_LOG = (message, data) => {
    console.log(`[ ${DateFormat(new Date(), 'H:MM:ss')} ] [SP-BOT] ${message}`, data)
}

export { SPB_LOG }