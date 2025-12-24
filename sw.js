// Vaeloris Service Worker - Fixed for GitHub Pages
const CACHE_NAME = 'vaeloris-v2';

// Install - cache the main page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache the essentials with relative paths
      return cache.addAll([
        './',
        './index.html'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - try network first, fall back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cached) => {
          // Return cached or fallback to main page
          return cached || caches.match('./index.html');
        });
      })
  );
});
