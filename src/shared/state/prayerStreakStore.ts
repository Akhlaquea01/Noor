import { create } from 'zustand'
import { prayerStreakRepo } from '../db/repositories'
import { DEFAULT_PRAYER_STREAK, type PrayerStreakRecord } from '../db/types'

interface PrayerStreakState {
  streak: PrayerStreakRecord
  hydrated: boolean
  hydrate: () => Promise<void>
  setStreak: (streak: PrayerStreakRecord) => void
}

// Reactive store, mirroring useQuranProgressStore — so the Home dashboard's
// streak card updates immediately when a day's 5th prayer is logged
// elsewhere (the Calendar page), instead of racing a stale IndexedDB read.
export const usePrayerStreakStore = create<PrayerStreakState>((set) => ({
  streak: DEFAULT_PRAYER_STREAK,
  hydrated: false,
  async hydrate() {
    const streak = await prayerStreakRepo.get()
    set({ streak, hydrated: true })
  },
  setStreak(streak) {
    set({ streak })
  },
}))
