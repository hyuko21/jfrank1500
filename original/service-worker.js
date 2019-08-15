'use strict';

const CACHE_NAME = 'static-cache-v3';
const DATA_CACHE_NAME = 'data-cache-v3';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './scripts/app.js',
  './scripts/install.js',
  './scripts/luxon-1.11.4.js',
  './styles/inline.css',
  './images/add.svg',
  './images/clear-day.svg',
  './images/clear-night.svg',
  './images/cloudy.svg',
  './images/fog.svg',
  './images/hail.svg',
  './images/install.svg',
  './images/partly-cloudy-day.svg',
  './images/partly-cloudy-night.svg',
  './images/rain.svg',
  './images/refresh.svg',
  './images/sleet.svg',
  './images/snow.svg',
  './images/thunderstorm.svg',
  './images/tornado.svg',
  './images/wind.svg',
];

self.addEventListener('install', function (evt) {
  console.log('[ServiceWorker] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (evt) {
  console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('/forecast/')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(function (cache) {
        return fetch(evt.request)
          .then(function (response) {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          }).catch(function (err) {
            return cache.match(evt.request);
          });
      }));
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(evt.request)
        .then((response) => {
          return response || fetch(evt.request);
        });
    })
  );
});