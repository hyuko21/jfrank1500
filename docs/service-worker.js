'use strict';

const CACHE_ARQUIVOS = 'static-cache-v1.2';
const CACHE_DADOS = 'data-cache-v1.2';

const ARQUIVOS_A_CACHEAR = [
  './',
  './index.html', './index.js', './estilos.css',
  './manifest.json',
  './img/atualizar.svg', './img/instalar.svg', './img/mais.svg',
  './img/favicon.ico',
  './img/icon-128x128.png', './img/icon-152x152.png', './img/icon-384x384.png', './img/icon-72x72.png',
  './img/icon-144x144.png', './img/icon-192x192.png', './img/icon-512x512.png', './img/icon-96x96.png',
  './vendor/w3.css', './vendor/w3-theme-indigo.css'
];

self.addEventListener('install', function (evt) {
  console.log('[ServiceWorker] Evento install');
  evt.waitUntil(
    caches.open(CACHE_ARQUIVOS).then(function (cache) {
      console.log('[ServiceWorker] Pre-cacheando recursos offline');
      return cache.addAll(ARQUIVOS_A_CACHEAR);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (evt) {
  console.log('[ServiceWorker] Evento activate');
  evt.waitUntil(
    caches.keys().then(function (listaChaves) {
      return Promise.all(listaChaves.map(function (chave) {
        if (chave !== CACHE_ARQUIVOS && chave !== CACHE_DADOS) {
          console.log('[ServiceWorker] Removendo cache antigo', chave);
          return caches.delete(chave);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('/jokes/')) {
    console.log('[Service Worker] Evento fetch', evt.request.url);
    // Tenta cache
    evt.respondWith(
      caches.open(CACHE_DADOS).then(async function (cache) {
        try {
          const response = await fetch(evt.request);
          if (response.status === 200) {
            console.log('Atualizando cache...');
            cache.put(evt.request.url, response.clone());
          }
          return response;
        } catch (err) {
          return cache.match(evt.request);
        }
      }));
    return;
  }
  evt.respondWith(
    caches.open(CACHE_ARQUIVOS).then(async function (cache) {
      const response = await cache.match(evt.request);
      return response || fetch(evt.request);
    })
  );
});