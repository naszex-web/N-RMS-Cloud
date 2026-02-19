const CACHE_NAME = 'rms-v8.2-cache';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './logo-192.png',
  './logo-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => k !== CACHE_NAME && caches.delete(k))
    ))
  );
  // Pastikan SW baru terus ambil alih tanpa perlu user tutup app
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Abaikan POST/PUT/DELETE (macam request Firebase)
  if (e.request.method !== 'GET') return;

  // SPA Routing & Safari Fix: Cuba ambil dari Network dulu, kalau offline baru bagi index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Aset statik: Cari dalam cache dulu, kalau takde baru request dari Network
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
