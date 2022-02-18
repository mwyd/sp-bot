import { fetchBackground } from '@/utils'
import internalAction from '@/enums/internalAction'

export default function({ service }) {
    const getBuyCounter = async () => fetchBackground({
        service,
        data: {
            action: internalAction.GET_BUY_COUNTER
        }
    })

    const incrementBuyCounter = async () => fetchBackground({
        service,
        data: {
            action: internalAction.INCREMENT_BUY_COUNTER
        }
    })

    return {
        getBuyCounter,
        incrementBuyCounter
    }
}