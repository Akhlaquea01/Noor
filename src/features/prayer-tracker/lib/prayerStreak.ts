import { prayerStreakRepo } from '../../../shared/db/repositories'
import { usePrayerStreakStore } from '../../../shared/state/prayerStreakStore'
import type { PrayerStreakRecord } from '../../../shared/db/types'

function isDayImmediatelyBefore(earlierKey: string, laterKey: string): boolean {
  const [y, m, d] = earlierKey.split('-').map(Number)
  const next = new Date(y, m - 1, d + 1)
  const nextKey = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
  return nextKey === laterKey
}

// Mirrors the continuity algorithm in src/features/quran/lib/quranProgress.ts
// (same-day no-op, day-immediately-before -> increment, any bigger gap ->
// reset to 1) with one necessary deviation: Quran reading sessions are
// always recorded live, so that algorithm anchors "yesterday" to real
// wall-clock today. Prayers can be logged retroactively for past days (a
// confirmed requirement — the calendar lets you back-fill any past day), so
// continuity here is judged relative to `dateKey` itself, and completing a
// day chronologically BEFORE the streak's current anchor is a pure no-op —
// it neither extends nor resets a streak that has already moved past it.
export async function advancePrayerStreak(dateKey: string): Promise<PrayerStreakRecord> {
  const current = await prayerStreakRepo.get()
  if (current.streakLastDate === dateKey) return current
  if (current.streakLastDate && current.streakLastDate > dateKey) return current

  const currentStreakCount =
    current.streakLastDate && isDayImmediatelyBefore(current.streakLastDate, dateKey)
      ? current.currentStreakCount + 1
      : 1
  const longestStreak = Math.max(current.longestStreak, currentStreakCount)
  const next: PrayerStreakRecord = { currentStreakCount, longestStreak, streakLastDate: dateKey }
  await prayerStreakRepo.set(next)
  usePrayerStreakStore.getState().setStreak(next)
  return next
}
