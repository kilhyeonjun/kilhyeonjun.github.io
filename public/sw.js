// Tombstone service worker for the previous Gatsby site.
// The current Astro site intentionally does not use a service worker.
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      self.caches ? self.caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
          var lower = String(key).toLowerCase();
          if (
            lower.indexOf('gatsby') !== -1 ||
            lower.indexOf('offline') !== -1 ||
            lower.indexOf('page-data') !== -1 ||
            lower.indexOf('webpack') !== -1 ||
            lower.indexOf('workbox') !== -1
          ) {
            return self.caches.delete(key);
          }
          return false;
        }));
      }) : Promise.resolve(),
    ]).then(function () {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (clients) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'legacy-sw-unregistered' });
      });
    })
  );
});
