const CACHE_NAME = 'rms-v8.1-cache';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './settings.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.map(k => k !== CACHE_NAME && caches.delete(k))
  )));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // FIX UNTUK SAFARI: Elak cache redirection untuk navigasi
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
