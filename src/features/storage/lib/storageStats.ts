import { downloadsRepo } from '../../../shared/db/repositories'
import { AUDIO_CACHE_NAME } from '../../downloads/lib/downloadEngine'

export interface StorageStats {
  quotaBytes: number | null
  usageBytes: number | null
  audioBytes: number
  downloadCount: number
}

export async function getStorageStats(): Promise<StorageStats> {
  const downloads = await downloadsRepo.list()
  const complete = downloads.filter((d) => d.status === 'complete')
  const audioBytes = complete.reduce((sum, d) => sum + d.sizeBytes, 0)

  let quotaBytes: number | null = null
  let usageBytes: number | null = null
  if (navigator.storage?.estimate) {
    const estimate = await navigator.storage.estimate()
    quotaBytes = estimate.quota ?? null
    usageBytes = estimate.usage ?? null
  }

  return { quotaBytes, usageBytes, audioBytes, downloadCount: complete.length }
}

// Removes any noor-audio-cache entry that isn't backed by a `downloads` row
// still marked complete — leftovers from an interrupted download or a bug,
// never a legitimate download the user asked to keep.
export async function clearOrphanedCache(): Promise<number> {
  const downloads = await downloadsRepo.list()
  const wantedKeys = new Set(downloads.filter((d) => d.status === 'complete').map((d) => d.cacheStorageKey))
  const cache = await caches.open(AUDIO_CACHE_NAME)
  const requests = await cache.keys()
  let removed = 0
  for (const request of requests) {
    if (!wantedKeys.has(request.url)) {
      await cache.delete(request)
      removed += 1
    }
  }
  return removed
}

// Deletes only Cache Storage entries + the `downloads` metadata rows.
// Never touches quranProgress/bookmarks/favorites/learningProgress/
// tasbihSessions — those live in separate IndexedDB stores this function
// doesn't reference, so there's no accidental overlap by construction.
export async function deleteAllOfflineContent(): Promise<void> {
  await caches.delete(AUDIO_CACHE_NAME)
  const downloads = await downloadsRepo.list()
  for (const d of downloads) {
    await downloadsRepo.remove(`${d.contentType}:${d.scopeId}`)
  }
}
