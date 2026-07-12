const CACHE = 'golden-stay-v1';
const PRECACHE = ['/', '/manifest.json', '/favicon.png', '/logo.png'];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: remove outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET; let POST/PATCH pass through untouched
  if (request.method !== 'GET') return;

  // Never intercept Supabase API or Razorpay — always need live data
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('razorpay.com')) return;

  // Cache-first: Vite hashed bundles (/assets/...) — these are immutable
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetchAndCache(request))
    );
    return;
  }

  // Cache-first: images from Unsplash and any image request
  if (url.hostname.includes('unsplash.com') || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetchAndCache(request))
    );
    return;
  }

  // Cache-first: Google Fonts (stylesheet + font files)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetchAndCache(request))
    );
    return;
  }

  // Network-first: HTML navigation — always try live, fall back to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }
});

function fetchAndCache(request) {
  return fetch(request).then(response => {
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, clone));
    }
    return response;
  });
}
