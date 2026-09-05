import { describe, it, expect, beforeEach } from 'vitest'
import { exportBackup, restoreBackup, isNoorBackup } from './backup'
import { bookmarksRepo, userPreferencesRepo, downloadsRepo } from './repositories'
import { DEFAULT_USER_PREFERENCES } from './types'
import type { Bookmark, DownloadRecord } from './types'

const bookmark: Bookmark = {
  localId: 'b1',
  updatedAt: 1,
  dirty: false,
  contentType: 'dua',
  duaId: 'dua-1',
  createdAt: 1,
}

const download: DownloadRecord = {
  localId: 'd1',
  updatedAt: 1,
  dirty: false,
  contentType: 'quran-audio',
  scope: 'surah',
  scopeId: '1',
  sizeBytes: 100,
  status: 'complete',
  progressPct: 100,
  cacheStorageKey: 'noor-audio-cache::1',
  downloadedAt: 1,
  version: '1',
}

describe('backup export/restore', () => {
  beforeEach(async () => {
    await bookmarksRepo.put('b1', bookmark)
    await downloadsRepo.put('d1', download)
    await userPreferencesRepo.set(DEFAULT_USER_PREFERENCES)
  })

  it('excludes downloads (audio blobs live in Cache Storage, not IndexedDB)', async () => {
    const backup = await exportBackup()
    expect(backup.stores.downloads).toBeUndefined()
    expect(backup.stores.bookmarks.some((e) => e.key === 'b1')).toBe(true)
  })

  it('excludes per-device state (installId, cached GPS fallback) from the backup', async () => {
    const backup = await exportBackup()
    expect(backup.stores.appMeta).toBeUndefined()
    expect(backup.stores.qiblaCache).toBeUndefined()
  })

  it('round-trips a store back to its exact backed-up contents', async () => {
    const backup = await exportBackup()

    await bookmarksRepo.put('b2', { ...bookmark, localId: 'b2' })
    expect(await bookmarksRepo.list()).toHaveLength(2)

    await restoreBackup(backup)

    const restored = await bookmarksRepo.list()
    expect(restored).toHaveLength(1)
    expect(restored[0].localId).toBe('b1')
  })

  it('leaves untouched stores (like downloads) alone on restore', async () => {
    const backup = await exportBackup()
    await restoreBackup(backup)
    expect(await downloadsRepo.get('d1')).toEqual(download)
  })

  it('rejects a file that is not a Noor backup', async () => {
    expect(isNoorBackup({ app: 'other' })).toBe(false)
    expect(isNoorBackup(null)).toBe(false)
    await expect(restoreBackup({ app: 'other' } as never)).rejects.toThrow('not a Noor backup')
  })

  it('rejects a backup whose `stores` is an array rather than a keyed record', () => {
    expect(isNoorBackup({ app: 'noor', stores: [] })).toBe(false)
  })
})
