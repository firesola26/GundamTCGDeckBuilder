// service-worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('gundam-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/stylesheet.css',
        '/functions.js',
        '/cardsData.js',
        '/icons/icon-192.png',
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});