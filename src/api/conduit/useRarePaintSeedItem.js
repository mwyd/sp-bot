import { fetchBackground } from '@/utils'

export default function ({ baseUrl, service }) {
  const get = (token, { steam_short_name, paintseed }) => fetchBackground({
    service,
    data: {
      path: baseUrl + `/csgo-rare-paint-seed-items?search=${steam_short_name}&paint_seed=${paintseed}`,
      config: {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    }
  })

  return {
    get
  }
}