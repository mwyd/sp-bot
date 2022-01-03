import { fetchJson } from '@/utils'

export default function({ baseUrl, credentials, headers }) {
    const getStatus = () => fetchJson(baseUrl + '/api/market/is_logged', { credentials, headers })

    const getItems = query => {
        const queryParams = new URLSearchParams(query)

        return fetchJson(baseUrl + `/api/market/get_items?${queryParams.toString()}`, { credentials, headers })
    }

    const buy = (csrfCookie, { id, price_market_usd }) => fetchJson(baseUrl + '/api/market/buy_item', {
        credentials,
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${id}`
            + `&price=${price_market_usd}`
            + `&csrf_token=${csrfCookie}`
    })

    const getBuyHistory = query => {
        const formData = new URLSearchParams(query)

        return fetchJson(baseUrl + '/en/profile/get_bought_history', {
            credentials,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })
    }

    return {
        getStatus,
        getItems,
        buy,
        getBuyHistory
    }
}