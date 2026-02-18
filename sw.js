const CACHE_NAME = 'rms-v8-cache';
const urlsToCache = ['./index.html', './login.html', './settings.html', './manifest.json', './logo.png'];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    // Strategi: Cuba Internet dulu, kalau gagal baru guna Cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
