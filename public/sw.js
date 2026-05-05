// Mission Control Service Worker — Self-destruct version
// This file exists to force-unregister any stale PWA service workers
// that may be serving cached HTML instead of JS/CSS assets.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          console.log('[SW] Deleting stale cache:', key);
          return caches.delete(key);
        })
      )
    ).then(() => {
      console.log('[SW] All caches cleared. Unregistering self...');
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});
