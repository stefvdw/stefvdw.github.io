const VERSION = 1
const CACHE_NAME = `countdown-cache-v${VERSION}`

self.addEventListener('install', event => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(onActivate()))
self.addEventListener('fetch', event => event.waitUntil(cacheThenNetwork(event)))


async function onActivate() {
  await cleanCache()
  await clients.claim()
  console.log(`Now running version ${VERSION} of app`)
}

async function cleanCache() {
  let cacheNames = await caches.keys()
  return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
}

async function cacheThenNetwork(event) {
  let requestURL = new URL(event.request.url)
  
  // Modules should be cached and request mode set to cors
  if (event.request.url.endsWith('.mjs')) {
    return event.respondWith(responeFromCacheOrFetch(makeCorsRequest(event.request)))
  }
  
  // Files from origin should be in cache
  if (requestURL.origin == location.origin) {  
    return event.respondWith(responeFromCacheOrFetch(event.request))
  }
  
  // Default fetch
  return
}

function makeCorsRequest(request) {
  return new Request(request.url, { 
    mode: 'cors', 
    credentials: 'omit' 
  })
}

async function responeFromCacheOrFetch(request) {
  return await caches.match(request) || fetch(request).then(async networkResponse => {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, networkResponse.clone())
    return networkResponse
  })
}


