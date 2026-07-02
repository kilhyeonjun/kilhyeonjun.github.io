// Legacy Gatsby -> Astro migration cleanup.
// This site no longer uses a service worker. Old Gatsby/offline-plugin caches can
// serve stale app-shell JS that requests /page-data/*.json and renders a blank page.
(function () {
  var MARKER = 'kilhyeonjun-blog-legacy-cache-cleanup-v1';

  function hasStorageMarker() {
    try {
      return window.localStorage && window.localStorage.getItem(MARKER) === 'done';
    } catch (_) {
      return false;
    }
  }

  function setStorageMarker() {
    try {
      if (window.localStorage) window.localStorage.setItem(MARKER, 'done');
    } catch (_) {
      // Ignore storage restrictions/private mode.
    }
  }

  function deleteLegacyCaches() {
    if (!('caches' in window)) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          var lower = String(key).toLowerCase();
          if (
            lower.indexOf('gatsby') !== -1 ||
            lower.indexOf('offline') !== -1 ||
            lower.indexOf('page-data') !== -1 ||
            lower.indexOf('webpack') !== -1 ||
            lower.indexOf('workbox') !== -1
          ) {
            return caches.delete(key);
          }
          return false;
        })
      );
    });
  }

  function unregisterServiceWorkers() {
    if (!('serviceWorker' in navigator)) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (registrations) {
      return Promise.all(registrations.map(function (registration) {
        return registration.unregister();
      }));
    });
  }

  if (hasStorageMarker()) return;

  Promise.all([deleteLegacyCaches(), unregisterServiceWorkers()])
    .catch(function () {
      // Never block rendering because cleanup failed.
    })
    .then(setStorageMarker);
})();
