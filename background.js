(async function () {
  chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ enabled: false });
  });

  let isEnabled = false;
  let allowedDomains = [];

  const response = await fetch(chrome.runtime.getURL("info.json"));
  const data = await response.json();
  allowedDomains = data.allowed_domains;

  function closeTab(tabId) {
    chrome.tabs.remove(tabId, function () {
      if (chrome.runtime.lastError); // to get rid of error message
    });
  }


  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "sync" && "enabled" in changes) {
      isEnabled = changes.enabled.newValue;
      if (isEnabled) {
        chrome.tabs.query({}, function (tabs) {
          for (let tab of tabs) {
            if (!tab.url) continue;
            if (tab.url.startsWith("chrome-extension://") || tab.url.startsWith("chrome://") || !isEnabled)
              continue;
            let url = new URL(tab.url);
            if (url.hostname in allowedDomains) continue;
            closeTab(tab.id);
          }
        });
      }
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url) return;
    if (tab.url.startsWith("chrome-extension://") || tab.url.startsWith("chrome://") || !isEnabled)
      return;
    let url = new URL(tab.url);
    for (let i = 0; i < allowedDomains.length; i++) {
      if (url.hostname === allowedDomains[i]) {
        return;
      }
    }
    closeTab(tabId);
  });
})();

// TODO: add domain name checking