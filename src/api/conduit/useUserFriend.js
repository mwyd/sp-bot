import { fetchBackground } from "@/utils";

export default function ({ baseUrl, service }) {
  const all = (token, query) => {
    const queryParams = new URLSearchParams(query);

    return fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-friends?${queryParams.toString()}`,
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
  };

  const create = (token, { shadowpayUserId, name }) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + "/shadowpay-friends",
        config: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `shadowpay_user_id=${shadowpayUserId}` + `&name=${name}`,
        },
      },
    });

  const update = (token, { id, friend }) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-friends/${id}`,
        config: {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body:
            `shadowpay_user_id=${friend.shadowpayUserId}` +
            `&name=${friend.name}`,
        },
      },
    });

  const remove = (token, id) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-friends/${id}`,
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
