// 이음케어라이프 Service Worker
// 캐싱 전략 구현으로 성능 최적화

const CACHE_NAME = 'ieumcarelife-v1.0.0';
const STATIC_CACHE_NAME = 'ieumcarelife-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ieumcarelife-dynamic-v1.0.0';

// 캐시할 정적 자원들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 캐시 전략별 URL 패턴
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

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    Promise.all([
      // 정적 자원 캐시
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 즉시 활성화
      self.skipWaiting()
    ])
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 클라이언트 제어
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome extension이나 dev tools 요청 무시
  if (url.protocol === 'chrome-extension:' || url.protocol === 'devtools:') {
    return;
  }

  // 캐시 전략 결정
  const strategy = getCacheStrategy(request.url);

  event.respondWith(
    handleRequest(request, strategy)
  );
});

// 캐시 전략 결정 함수
function getCacheStrategy(url) {
  // Cache First (정적 자원)
  if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url))) {
    return 'cache-first';
  }

  // Stale While Revalidate (이미지, API)
  if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(url))) {
    return 'stale-while-revalidate';
  }

  // Network First (동적 콘텐츠)
  if (CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url))) {
    return 'network-first';
  }

  // 기본값: Stale While Revalidate
  return 'stale-while-revalidate';
}

// 요청 처리 함수
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

// Cache First 전략
async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First 전략
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network first fallback to cache:', error);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate 전략
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Stale while revalidate network failed:', error);
    return cachedResponse;
  });

  return cachedResponse || await fetchPromise;
}

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 백그라운드 작업 수행
      doBackgroundWork()
    );
  }
});

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('이음케어라이프', options)
  );
});

// 백그라운드 작업
async function doBackgroundWork() {
  try {
    // 여기에 백그라운드에서 수행할 작업 추가
    console.log('[SW] Background work completed');
  } catch (error) {
    console.error('[SW] Background work failed:', error);
  }
}

// 에러 처리
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});
