/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// Tier 1: app shell + bundled Quran/Dua/Wudu/Salah/Blog/Story JSON content.
// The precache manifest (self.__WB_MANIFEST) is injected at build time by
// vite-plugin-pwa's injectManifest strategy, based on the globPatterns in
// vite.config.ts. Its cache name is versioned by Workbox automatically, and
// cleanupOutdatedCaches() below evicts stale entries on activation — this is
// the app-update mechanism. IndexedDB is separate storage and is never
// touched by this cleanup, so user progress survives every update.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Tier 2: opt-in Quran recitation audio, written explicitly by the Download
// Manager (src/features/downloads) via caches.open('noor-audio-cache'). The
// audio itself is served cross-origin from mp3quran.net (a long-established,
// CORS-enabled public Quran audio host — see lib/audioSource.ts) rather than
// bundled, so this route matches by host rather than by same-origin path.
// Cache-first: once downloaded, playback never re-hits the network even
// when online, and works fully offline.
registerRoute(
  ({ url }) => url.hostname.endsWith('mp3quran.net'),
  new CacheFirst({
    cacheName: 'noor-audio-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// Update flow: the app shows an "update available" prompt (built in M10) that
// posts SKIP_WAITING to move a waiting worker into activation immediately.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', () => {
  self.clients.claim()
})
