import { fetchBackground } from "@/utils";

export default function ({ baseUrl, service }) {
  const all = (token, query) => {
    const queryParams = new URLSearchParams(query);

    return fetchBackground({
      service,
      data: {
        path: baseUrl + `/shadowpay-bot-configs?${queryParams.toString()}`,
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });
  };

  const upsert = (token, config) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + "/shadowpay-bot-configs",
        config: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `config=${JSON.stringify(config)}`,
        },
      },
    });

  return {
    all,
    upsert,
  };
}
