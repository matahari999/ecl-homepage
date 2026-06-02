// 이음케어라이프 Service Worker v4
const CACHE_NAME = 'ieumcarelife-v4.0.0';
const STATIC_CACHE_NAME = 'ieumcarelife-static-v4.0.0';
const DYNAMIC_CACHE_NAME = 'ieumcarelife-dynamic-v4.0.0';

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([
    caches.open(STATIC_CACHE_NAME).then(c => c.addAll(['/'])),
    self.skipWaiting()
  ]));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then(names => Promise.all(
      names.map(n => {
        if (n !== STATIC_CACHE_NAME && n !== DYNAMIC_CACHE_NAME && n !== CACHE_NAME)
          return caches.delete(n);
      })
    )),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:') return;

  if (/\.(js|css|html)$/.test(url.pathname) || url.pathname === '/' || !url.pathname.includes('.')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
