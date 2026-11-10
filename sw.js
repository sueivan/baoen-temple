/* Bump the cache name whenever a release changes the app's files. */
const CACHE_PREFIX = 'baoen-temple-';
const CACHE = CACHE_PREFIX + '2.0.2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './assets/favicon.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/icon-maskable.png',
  './assets/css/style.css?v=2.0.1', './assets/vendor/three.r128.min.js',
  './assets/js/boot.js', './assets/js/state.js', './assets/js/navigation.js',
  './assets/js/i18n.js', './assets/js/hall-camera.js?v=2.0.2', './assets/js/world.js?v=2.0.2', './assets/js/audio.js', './assets/js/input.js?v=2.0.1', './assets/js/app.js?v=2.0.2'
];
const allowed = new Set(FILES.map(path => new URL(path,self.location.href).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await caches.match(new URL('./index.html',self.location.href).href);
      return cached || Response.error();
    }));
  } else if (allowed.has(request.url)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
