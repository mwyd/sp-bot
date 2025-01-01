import { fetchJson } from "@/utils";

export default function ({ baseUrl, credentials, headers }) {
  const all = (query) => {
    const queryParams = new URLSearchParams(query);

    return fetchJson(
      baseUrl + `/api/market/list_items?${queryParams.toString()}`,
      {
        credentials,
        headers: headers(),
      },
    );
  };

  const update = (id, price) =>
    fetchJson(baseUrl + "/api/market/save_item_prices", {
      credentials,
      method: "POST",
      headers: {
        ...headers(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `offers[0][id]=${id}` + `&offers[0][price]=${price}`,
    });

  return {
    all,
    update,
  };
}
