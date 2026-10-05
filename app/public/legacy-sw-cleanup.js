/**
 * Legacy service worker cache cleanup.
 *
 * Loaded via workbox importScripts and runs on every activation.
 *
 * The precache cache is deliberately NOT touched here: releases up to and
 * including 0.12.x (workbox 4/5) and current releases (workbox 7) derive the
 * same "workbox-precache-v2-<origin>" cache name, so the current worker's own
 * activate step reconciles it and deletes the outdated entries. Purging it here
 * would fight the precache.
 *
 * Only legacy runtime caches are removed.
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("workbox-cache-v2-") ||
                key.startsWith("workbox-expiration")
            )
            .map((key) => caches.delete(key))
        )
      )
  );
});
