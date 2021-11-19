import { fetchJson } from '@/utils'

export default function({ baseUrl, credentials }) {
    const getStatus = () => fetchJson(baseUrl + '/api/market/is_logged', { credentials })

    const getItems = query => {
        const queryParams = new URLSearchParams(query)

        return fetchJson(baseUrl + `/api/market/get_items?${queryParams.toString()}`, { credentials })
    }

    const buy = (csrfCookie, { id, price_market_usd }) => fetchJson(baseUrl + '/api/market/buy_item', {
        credentials,
        method: 'POST',
        headers: {
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