/* Hesap — service worker
   Güncelleme modeli: her şey NETWORK-FIRST, ağ yoksa önbellekten.
   Böylece yeni sürüm yayına girdiği an, uygulama bir dahaki açılışında
   (veya açıkken yapılan otomatik kontrolde) kendini günceller —
   ana ekrandaki simgeyi silip yeniden eklemek GEREKMEZ.
   CACHE_NAME yalnızca çevrimdışı kopyanın adıdır; artırmak zorunlu değil. */

var CACHE_NAME = "hesap-pwa-v6";

var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./css/app.css",
  "./js/format.js",
  "./js/db.js",
  "./js/config.js",
  "./js/sync.js",
  "./js/app.js",
  "./fonts/Outfit-VariableFont_wght.ttf",
  "./fonts/InstrumentSerif-Regular.ttf",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

/* ağ isteği başarısız olursa kullanılacak süre */
var NET_TIMEOUT_MS = 6000;

function withTimeout(promise, ms) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; reject(new Error("timeout")); } }, ms);
    promise.then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
                 function (e) { if (!done) { done = true; clearTimeout(t); reject(e); } });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" })).catch(function (err) {
          console.warn("[SW] precache atlandı:", url, err && err.message);
        });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) {
          console.log("[SW] eski önbellek silindi:", k);
          return caches.delete(k);
        }
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
      /* açık sekmelere "yeni sürüm devrede" haber ver */
      return self.clients.matchAll({ type: "window" }).then(function (list) {
        list.forEach(function (c) {
          try { c.postMessage({ type: "SW_ACTIVATED", cache: CACHE_NAME }); } catch (e) {}
        });
      });
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* sürüm dosyası asla önbellekten okunmaz */
  if (/\/version\.json$/.test(url.pathname)) {
    event.respondWith(fetch(req, { cache: "no-store" }).catch(function () {
      return new Response('{"version":"?"}', { headers: { "Content-Type": "application/json" } });
    }));
    return;
  }

  /* network-first: yeni sürüm hemen gelsin, ağ yoksa önbellek */
  event.respondWith(
    withTimeout(fetch(req, { cache: "no-cache" }), NET_TIMEOUT_MS).then(function (res) {
      if (res && res.ok && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        /* belge isteği ise kabuğu ver */
        if (req.mode === "navigate" || req.destination === "document") {
          return caches.match("./index.html").then(function (m) {
            return m || caches.match("./");
          }).then(function (m) {
            return m || new Response(
              '<!doctype html><meta charset="utf-8"><title>Hesap</title>' +
              '<div style="font-family:-apple-system,sans-serif;padding:40px 24px">' +
              'Çevrimdışısın ve önbellekte sayfa yok. Bağlanınca yeniden dene.</div>',
              { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 200 }
            );
          });
        }
        return new Response("", { status: 504 });
      });
    })
  );
});

self.addEventListener("message", function (event) {
  var d = event.data;
  if (d === "skipWaiting" || (d && d.type === "SKIP_WAITING")) {
    self.skipWaiting();
    return;
  }
  /* sayfadan gelen "sürümünü söyle" isteği */
  if (d && d.type === "GET_VERSION") {
    var port = event.ports && event.ports[0];
    if (port) port.postMessage({ cache: CACHE_NAME });
  }
});
