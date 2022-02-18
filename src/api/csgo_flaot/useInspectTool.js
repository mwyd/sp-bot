import { fetchBackground } from '@/utils'

export default function({ baseUrl, service }) {
    const get = inspectLink => fetchBackground({
        service,
        data: {
            path: baseUrl + `/?url=${inspectLink}`
        }
    })

    return {
        get
    }
}