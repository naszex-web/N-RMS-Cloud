const CACHE_NAME = 'naszex-cache-v2'; // Tukar nama version supaya dia refresh
const urlsToCache = [
  './index.html', // Jangan letak './' sahaja, mesti spesifik filename
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Paksa update segera
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Buang cache lama yang rosak
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      // Cuba ambil dari Internet dulu (Network First)
      try {
        const networkResponse = await fetch(event.request);
        
        // Kalau berjaya, simpan copy baru dalam cache (kecuali redirect)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Kalau tak ada internet, baru ambil dari Cache
        console.log('Offline, serving cache');
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Kalau user tengah buka page utama tapi offline & cache tak jumpa
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
      }
    })()
  );
});
