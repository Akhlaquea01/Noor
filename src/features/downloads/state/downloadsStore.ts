import { create } from 'zustand'
import { downloadsRepo } from '../../../shared/db/repositories'
import { createSyncMeta, touchSyncMeta } from '../../../shared/db/syncMeta'
import { downloadSurahAudio, deleteSurahAudio } from '../lib/downloadEngine'
import { RECITER_LABEL } from '../lib/audioSource'
import type { DownloadRecord } from '../../../shared/db/types'

function keyFor(surah: number): string {
  return `quran-audio:${surah}`
}

function applyDownload(state: DownloadsState, key: string, record: DownloadRecord): Pick<DownloadsState, 'downloads'> {
  const next = new Map(state.downloads)
  next.set(key, record)
  return { downloads: next }
}

interface DownloadsState {
  downloads: Map<string, DownloadRecord>
  hydrated: boolean
  hydrate: () => Promise<void>
  startDownload: (surah: number) => Promise<void>
  removeDownload: (surah: number) => Promise<void>
  getStatus: (surah: number) => DownloadRecord | undefined
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: new Map(),
  hydrated: false,

  async hydrate() {
    const list = await downloadsRepo.list()
    const entries = list
      .filter((d) => d.contentType === 'quran-audio')
      .map((d) => [keyFor(Number(d.scopeId)), d] as const)
    set({ downloads: new Map(entries), hydrated: true })
  },

  getStatus(surah) {
    return get().downloads.get(keyFor(surah))
  },

  async startDownload(surah) {
    const key = keyFor(surah)
    const queued: DownloadRecord = {
      ...createSyncMeta(),
      contentType: 'quran-audio',
      scope: 'surah',
      scopeId: String(surah),
      reciterId: RECITER_LABEL,
      sizeBytes: 0,
      status: 'downloading',
      progressPct: 0,
      cacheStorageKey: '',
      downloadedAt: null,
      version: '1',
    }
    set((state) => applyDownload(state, key, queued))
    await downloadsRepo.put(key, queued)

    try {
      const { sizeBytes, cacheStorageKey } = await downloadSurahAudio(surah, (percent) => {
        set((state) => {
          const current = state.downloads.get(key)
          if (!current) return state
          return applyDownload(state, key, { ...current, progressPct: percent })
        })
      })
      const complete = touchSyncMeta({
        ...queued,
        status: 'complete' as const,
        progressPct: 100,
        sizeBytes,
        cacheStorageKey,
        downloadedAt: Date.now(),
      })
      await downloadsRepo.put(key, complete)
      set((state) => applyDownload(state, key, complete))
    } catch {
      const failed = touchSyncMeta({ ...queued, status: 'error' as const })
      await downloadsRepo.put(key, failed)
      set((state) => applyDownload(state, key, failed))
    }
  },

  async removeDownload(surah) {
    const key = keyFor(surah)
    const existing = get().downloads.get(key)
    if (existing?.cacheStorageKey) await deleteSurahAudio(existing.cacheStorageKey)
    await downloadsRepo.remove(key)
    set((state) => {
      const next = new Map(state.downloads)
      next.delete(key)
      return { downloads: next }
    })
  },
}))
