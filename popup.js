chrome.storage.sync.get("enabled", function(result) {
  if(result.enabled) {
    document.getElementById("_status").innerHTML = "Enabled";
  } else {
    document.getElementById("_status").innerHTML = "Disabled";
  }
});

document.getElementById("_enable").addEventListener("click", () => {
  chrome.storage.sync.set({ enabled: true });
  document.getElementById("_status").innerHTML = "Enabled";
});

document.getElementById("_disable").addEventListener("click", () => {
  chrome.storage.sync.set({ enabled: false });
  document.getElementById("_status").innerHTML = "Disabled";
});
