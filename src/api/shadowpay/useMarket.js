import { fetchJson } from "@/utils";

export default function ({ baseUrl, credentials, headers }) {
  const getStatus = () =>
    fetchJson(baseUrl + "/api/market/is_logged", {
      credentials,
      headers: headers(),
    });

  const getItems = (query) => {
    const queryParams = new URLSearchParams(query);

    return fetchJson(
      baseUrl + `/api/market/get_items?${queryParams.toString()}`,
      { credentials, headers: headers() },
    );
  };

  const buy = (id, price_market_usd) =>
    fetchJson(baseUrl + "/api/market/buy_item", {
      credentials,
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `id=${id}` + `&price=${price_market_usd}`,
    });

  const getBuyHistory = (query) => {
    const formData = new URLSearchParams(query);

    return fetchJson(baseUrl + "/api/market/profile/get_bought_history", {
      credentials,
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
  };

  return {
    getStatus,
    getItems,
    buy,
    getBuyHistory,
  };
}
