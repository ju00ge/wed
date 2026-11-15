// WPA_wed — service worker. Версия: 2026.11.15-56d4cd8a
const CACHE = "bufer-2026.11.15-56d4cd8a";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("bufer-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Сначала сеть (свежая версия), при отсутствии сети или >4 с — копия из кэша
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const net = fetch(req, { cache: "no-cache" }).then(r => { if (r.ok) cache.put(req, r.clone()); return r; });
    const timeout = new Promise(res => setTimeout(res, 4000));
    try {
      const r = await Promise.race([net, timeout]);
      if (r) return r;
    } catch (_) {}
    const hit = await cache.match(req, { ignoreSearch: true }) || (req.mode === "navigate" && await cache.match("./index.html"));
    return hit || net;
  })());
});
