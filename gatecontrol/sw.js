const CACHE_VERSION = "gatecontrol-v2.2";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./embed.png",
  "./icon-192.png",
  "./icon-512.png",
  "./ackalarm.ogg",
  "./beep.ogg",
  "./bgaudio.ogg",
  "./blip.ogg",
  "./click.ogg",
  "./error.ogg",
  "./offline.ogg",
  "./processing.ogg",
  "./purge.ogg",
  "./reset.ogg",
  "./restore.ogg",
  "./scan.ogg",
  "./startup.ogg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_VERSION);
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            cache.put("./index.html", response.clone());
          }
          return response;
        } catch (err) {
          const cached = await cache.match("./index.html");
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (
          response &&
          response.ok &&
          (request.url.startsWith(self.location.origin) ||
            request.destination === "style" ||
            request.destination === "font")
        ) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});