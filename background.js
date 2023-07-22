(async function() {
  chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ enabled: false });
  });
  
  let isEnabled = false;
  let allowedDomains = [];

  const response = await fetch(chrome.runtime.getURL("info.json"));
  const data = await response.json();
  allowedDomains = data.allowed_domains;

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "sync" && "enabled" in changes) {
      isEnabled = changes.enabled.newValue;
    }
  });

  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (details.url.startsWith("chrome-extension://")) {
        return { cancel: false };
      }
      if (!isEnabled)
        return { cancel: false };
      let url = new URL(details.url);
      for (let i = 0; i < allowedDomains.length; i++) {
        if (url.hostname === allowedDomains[i]) {
          return { cancel: false };
        }
      }
      return { cancel: true };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
}) ();