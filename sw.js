const CACHE_NAME = "stocked-v2";

const FILES = [
    "/",
    "/index.html",
    "/recipes.html",
    "/analytics.html",

    "/css/styles.css",
    "/css/variables.css",
    "/css/recipes.css",
    "/css/analytics.css",

    "/js/database.js",
    "/js/app.js",
    "/js/recipes.js",
    "/js/analytics.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)

      .then((cache) => {
        return cache.addAll(FILES);
      }),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()

      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        );
      }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)

      .then((response) => {
        return response || fetch(event.request);
      }),
  );
});
