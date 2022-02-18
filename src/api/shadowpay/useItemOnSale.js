import { fetchJson } from '@/utils'

export default function({ baseUrl, credentials, headers }) {
    const all = () => fetchJson(baseUrl + '/api/market/list_items', { credentials, headers })

    const update = (csrfCookie, id, price) => fetchJson(baseUrl + '/api/market/save_item_prices', {
            credentials,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `offers[0][id]=${id}`
                + `&offers[0][price]=${price}`
                + `&csrf_token=${csrfCookie}`
    })
    
    return {
        all,
        update
    }
}