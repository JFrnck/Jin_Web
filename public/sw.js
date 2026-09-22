// Service worker del app shell -- deliberadamente mínimo.
//
// Objetivo único: que Jin abra (el shell visual) sin conexión. NO cachea
// nada de /api ni /socket.io -- ver el `if` en `fetch` de más abajo, que es
// la frontera real, no un comentario. Esto es un sistema de aprobaciones
// HITL: cachear una respuesta de /api/hitl/pending mostraría una aprobación
// ya resuelta como si siguiera pendiente, o peor, dejaría al owner creer
// que vio el estado real cuando vio un estado viejo. Sin red, cada pantalla
// ya sabe mostrar "Sin conexión con la API" (ver EmptyState/CardError en
// las rutas) -- ese es el comportamiento correcto offline, no un dato
// cacheado.
const CACHE_NAME = 'jin-shell-v1';
const SHELL_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Frontera real: /api y /socket.io SIEMPRE van a la red, sin tocar el
  // cache ni como fallback. Ídem cualquier request que no sea GET (no hay
  // POST/PUT idempotentes que tenga sentido cachear acá).
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Same-origin only -- no interceptar Google Fonts ni nada cross-origin,
  // que tengan su propio comportamiento de caché de navegador normal.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first con fallback a cache: siempre preferí la versión nueva
  // del shell si hay red; el cache es solo la red de seguridad offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/'))),
  );
});
