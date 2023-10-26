import apiService from "@/enums/apiService";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.origin !== "https://shadowpay.com") {
    return false;
  }

  const { service, data } = request;

  switch (service) {
    case apiService.CONDUIT:
      fetch(data.path, data.config ?? {})
        .then((res) => res.json())
        .then(sendResponse)
        .catch((err) =>
          sendResponse({
            success: false,
            error_message: err?.message ?? "Conduit error",
          }),
        );
      break;

    case apiService.CSGO_FLOAT:
      fetch(data.path, data.config ?? {})
        .then((res) => res.json())
        .then((data) => sendResponse({ success: true, data: data }))
        .catch((err) =>
          sendResponse({
            success: false,
            error_message: err?.message ?? "Csgo float error",
          }),
        );
      break;
  }

  return true;
});
