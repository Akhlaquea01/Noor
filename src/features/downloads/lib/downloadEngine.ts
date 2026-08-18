import { getSurahAudioUrl } from './audioSource'

export const AUDIO_CACHE_NAME = 'noor-audio-cache'

// Reads the response body once (tracking progress as bytes arrive) rather
// than fetching twice, then writes the reconstructed Response into Cache
// Storage — this is the explicit write the service worker's cache-first
// route (src/sw/sw.ts) depends on being present before it can serve audio
// offline.
export async function downloadSurahAudio(
  surahNumber: number,
  onProgress: (percent: number) => void
): Promise<{ sizeBytes: number; cacheStorageKey: string }> {
  const url = getSurahAudioUrl(surahNumber)
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download audio for surah ${surahNumber}: ${response.status}`)
  }

  const total = Number(response.headers.get('Content-Length')) || 0
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    if (total > 0) onProgress(Math.min(100, Math.round((loaded / total) * 100)))
  }

  const blob = new Blob(chunks as BlobPart[], { type: response.headers.get('Content-Type') ?? 'audio/mpeg' })
  const cache = await caches.open(AUDIO_CACHE_NAME)
  await cache.put(url, new Response(blob, { headers: response.headers }))

  return { sizeBytes: blob.size, cacheStorageKey: url }
}

export async function deleteSurahAudio(cacheStorageKey: string): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE_NAME)
  await cache.delete(cacheStorageKey)
}

export async function getCachedAudioUrl(cacheStorageKey: string): Promise<string | null> {
  const cache = await caches.open(AUDIO_CACHE_NAME)
  const response = await cache.match(cacheStorageKey)
  if (!response) return null
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
