import { create } from 'zustand'
import { quranProgressRepo } from '../db/repositories'
import { DEFAULT_QURAN_PROGRESS, type QuranProgressRecord } from '../db/types'

interface QuranProgressState {
  progress: QuranProgressRecord
  hydrated: boolean
  hydrate: () => Promise<void>
  setProgress: (progress: QuranProgressRecord) => void
}

// Reactive store (not a one-off fetch) so screens that display reading
// progress (Home dashboard, surah list) update immediately when the reader
// saves progress on navigation-away, instead of racing a stale IndexedDB
// read against the reader's async save on unmount.
export const useQuranProgressStore = create<QuranProgressState>((set) => ({
  progress: DEFAULT_QURAN_PROGRESS,
  hydrated: false,
  async hydrate() {
    const progress = await quranProgressRepo.get()
    set({ progress, hydrated: true })
  },
  setProgress(progress) {
    set({ progress })
  },
}))
