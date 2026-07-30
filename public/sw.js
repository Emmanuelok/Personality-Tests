// Cache only versioned, same-origin static assets. Navigation responses can carry
// checkout or other private state, so documents and query-bearing URLs are never
// inspected or stored here.
const CACHE = "psyche-atlas-static-v4";
const STATIC_DESTINATIONS = new Set(["script", "style", "image", "font", "manifest"]);

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (
    req.method !== "GET"
    || url.origin !== self.location.origin
    || url.search
    || url.pathname.startsWith("/api")
    || req.mode === "navigate"
    || req.destination === "document"
    || !STATIC_DESTINATIONS.has(req.destination)
  ) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) {
        event.waitUntil(
          fetch(req)
            .then((res) => {
              if (res.ok && res.type === "basic") return cache.put(req, res.clone());
              return undefined;
            })
            .catch(() => undefined),
        );
        return cached;
      }
      const response = await fetch(req);
      if (response.ok && response.type === "basic") {
        event.waitUntil(cache.put(req, response.clone()));
      }
      return response;
    })(),
  );
});
