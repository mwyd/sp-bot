import { fetchBackground } from "@/utils";

export default function ({ baseUrl, service }) {
  const single = (hashName) =>
    fetchBackground({
      service,
      data: {
        path: baseUrl + `/steam-market-csgo-items/${hashName}`,
      },
    });

  return {
    single,
  };
}
