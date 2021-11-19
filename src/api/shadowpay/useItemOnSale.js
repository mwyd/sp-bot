import { fetchJson } from '@/utils'

export default function({ baseUrl, credentials }) {
    const all = () => fetchJson(baseUrl + '/api/market/list_items', { credentials })

    const update = (csrfCookie, id, price) => fetchJson(baseUrl + '/api/market/save_item_price', {
            credentials,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
                + `&price=${price}`
                + `&csrf_token=${csrfCookie}`
    })
    
    return {
        all,
        update
    }
}