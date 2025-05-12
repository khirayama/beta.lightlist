self.addEventListener("install", () => {
  console.log("%cInstalling", "color: #9e9e9e;");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("%cActivating", "color: #9e9e9e;");
});

self.addEventListener("fetch", () => {
  // console.log(`%cFetching ${e.request.url}`, "color: #9e9e9e;");
});
