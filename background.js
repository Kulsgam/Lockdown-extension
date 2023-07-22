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

  function getTabInfo(tabId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, function(tab) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tab);
        }
      });
    });
  }

  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      return new Promise((resolve, reject) => {
        if (details.url.startsWith("chrome-extension://") || !isEnabled) {
          resolve({ cancel: false });
        } else if (details.tabId === -1) {
          resolve({ cancel: true });
        } else {
          getTabInfo(details.tabId).then(tabObj => {
            let url = new URL(tabObj.url);
            for (let i = 0; i < allowedDomains.length; i++) {
              console.log(url.hostname);
              console.log(allowedDomains[i]);
              if (url.hostname === allowedDomains[i]) {
                resolve({ cancel: false });
              }
            }
            resolve({ cancel: true });
          }).catch(error => {
            console.error("An error occurred:", error);
            resolve({ cancel: true });
          });
        }
      });
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
})();