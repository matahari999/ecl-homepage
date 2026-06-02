// 이음케어라이프 Service Worker
const CACHE_NAME = 'ieumcarelife-v2.0.0';
const STATIC_CACHE_NAME = 'ieumcarelife-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'ieumcarelife-dynamic-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: [
    /\.(css|js|woff2?|ttf|eot)$/,
    /\/static\//,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/
  ],
  STALE_WHILE_REVALIDATE: [
    /\/api\//,
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/
  ],
  NETWORK_FIRST: [
    /\/contact/,
    /\/testimonials/,
    /\/blog/
  ]
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }

  const strategy = getCacheStrategy(request.url);
  event.respondWith(handleRequest(request, strategy));
});

function getCacheStrategy(url) {
  if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url))) {
    return 'cache-first';
  }
  if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(url))) {
    return 'stale-while-revalidate';
  }
  if (CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url))) {
    return 'network-first';
  }
  return 'stale-while-revalidate';
}

async function handleRequest(request, strategy) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request, cache);
    case 'network-first':
      return networkFirst(request, cache);
    case 'stale-while-revalidate':
    default:
      return staleWhileRevalidate(request, cache);
  }
}

async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    const networkResponse = await fetch(request);
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => cachedResponse);
  return cachedResponse || await fetchPromise;
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundWork());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 }
  };
  event.waitUntil(
    self.registration.showNotification('이음케어라이프', options)
  );
});

async function doBackgroundWork() {
  try {
    console.log('[SW] Background work completed');
  } catch (error) {
    console.error('[SW] Background work failed:', error);
  }
}

self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});
