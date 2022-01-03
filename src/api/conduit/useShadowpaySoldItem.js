import { fetchBackground } from '../../utils'

export default function({ baseUrl, service }) {
    const get = hashName => fetchBackground({
        service,
        data: {
            path: baseUrl + `/shadowpay-sold-items?search=${hashName}`,
        }
    })
    
    return {
        get
    }
}