import { fetchBackground } from "@/utils";

export default function ({ baseUrl, service }) {
  const get = (token) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + "/user",
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    });

  return {
    get,
  };
}
