(async function () {
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

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;
    if (changeInfo.url.startsWith("chrome-extension://") || changeInfo.url.startsWith("chrome://") || !isEnabled)
      return;
    console.log(changeInfo.url);
    let url = new URL(changeInfo.url);
    for (let i = 0; i < allowedDomains.length; i++) {
      if (url.hostname === allowedDomains[i]) {
        return;
      }
    }

    chrome.tabs.remove(tabId);
  });

  // chrome.webRequest.onBeforeRequest.addListener(
  //   async function (details) {
  //     if (details.url.startsWith("chrome-extension://") || !isEnabled)
  //       return { cancel: false };
  //     if (details.tabId === -1)
  //       return { cancel: true };

  //     let tabObj = await getTabInfo(details.tabId);

  //     let url = new URL(tabObj.url);
  //     for (let i = 0; i < allowedDomains.length; i++) {
  //       console.log(url.hostname);
  //       console.log(allowedDomains[i]);
  //       if (url.hostname === allowedDomains[i]) {
  //         return { cancel: false };
  //       }
  //     }
  //     return { cancel: true };
  //   },
  //   { urls: ["<all_urls>"] },
  //   ["blocking"]
  // );
})();