import { fetchBackground } from "@/utils";

export default function ({ baseUrl, service }) {
  const all = (token, query) => {
    const queryParams = new URLSearchParams(query);

    return fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-sale-guard-items?${queryParams.toString()}`,
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
  };

  const create = (token, { shadowpayOfferId, hashName, minPrice, maxPrice }) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + "/shadowpay-sale-guard-items",
        config: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body:
            `shadowpay_offer_id=${shadowpayOfferId}` +
            `&hash_name=${hashName}` +
            `&min_price=${minPrice}` +
            `&max_price=${maxPrice}`,
        },
      },
    });

  const update = (token, { id, data }) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-sale-guard-items/${id}`,
        config: {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body:
            `shadowpay_offer_id=${data.shadowpayOfferId}` +
            `&min_price=${data.minPrice}` +
            `&max_price=${data.maxPrice}`,
        },
      },
    });

  const remove = (token, id) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-sale-guard-items/${id}`,
        config: {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });

  return {
    all,
    create,
    update,
    remove,
  };
}
