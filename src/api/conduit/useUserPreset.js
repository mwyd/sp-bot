import { fetchBackground } from '@/utils'

export default function({ baseUrl, service }) {
    const all = (token, query) => {
        const queryParams = new URLSearchParams(query)

        return fetchBackground({
            service,
            data: {
                path: baseUrl + `/shadowpay-bot-presets?${queryParams.toString()}`,
                config: {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            }
        })
    }

    const create = (token, preset) => fetchBackground({
        service,
        data: {
            path: baseUrl + '/shadowpay-bot-presets',
            config: {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `preset=${JSON.stringify(preset)}`
            }
        }
    })

    const update = (token, { id, preset }) => fetchBackground({
        service,
        data: {
            path: baseUrl + `/shadowpay-bot-presets/${id}`,
            config: {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `preset=${JSON.stringify(preset)}`
            }
        }
    })

    const remove = (token, id) => fetchBackground({
        service,
        data: {
            path: baseUrl + `/shadowpay-bot-presets/${id}`,
            config: {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        }
    })

    return {
        all,
        create,
        update,
        remove
    }
}