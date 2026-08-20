import { quranProgressRepo, readingSessionsRepo } from '../../../shared/db/repositories'
import { useQuranProgressStore } from '../../../shared/state/quranProgressStore'
import { localDateKey } from '../../../shared/lib/dateKey'
import type { QuranMeta } from '../types'

export function toGlobalAyahId(meta: QuranMeta, surah: number, ayah: number): number {
  let count = 0
  for (const s of meta.surahs) {
    if (s.number === surah) return count + ayah
    count += s.ayahCount
  }
  return count + ayah
}

export function findCurrentJuz(meta: QuranMeta, globalAyahId: number): number {
  const match = meta.juz.find((j) => globalAyahId >= j.startAyahId && globalAyahId <= j.endAyahId)
  return match?.juz ?? 1
}

// Extracted as a pure function (no repo/IndexedDB dependency) so the exact
// "must not credit skipped juz" fix is directly unit-testable — see
// quranProgress.test.ts for the regression this guards against.
export function computeNewlyCoveredJuz(meta: QuranMeta, globalAyahIdStart: number, globalAyahIdEnd: number): number[] {
  return meta.juz
    .filter((j) => globalAyahIdStart <= j.startAyahId && globalAyahIdEnd >= j.endAyahId)
    .map((j) => j.juz)
}

function isYesterday(dateKey: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateKey === localDateKey(yesterday)
}

interface RecordReadingArgs {
  meta: QuranMeta
  surah: number
  ayahStart: number
  ayahEnd: number
  startedAt: number
}

// Called when the user finishes a reading session (leaves the reader, or
// the app is backgrounded). A juz is only added to completedJuz once some
// session's ayah range has actually covered it start-to-end — NOT simply
// because the reader's current position is numerically past it. The reader
// lets users jump to any surah directly, so treating "reached ayah X" as
// "read everything before X" would falsely credit whole juz someone never
// opened (e.g. jumping straight to Surah 112 must not mark juz 1-29 done).
export async function recordReadingProgress({ meta, surah, ayahStart, ayahEnd, startedAt }: RecordReadingArgs) {
  const now = Date.now()
  await readingSessionsRepo.add({
    surah,
    ayahStart,
    ayahEnd,
    startedAt,
    endedAt: now,
    durationSec: Math.max(1, Math.round((now - startedAt) / 1000)),
  })

  const current = await quranProgressRepo.get()
  const globalAyahId = toGlobalAyahId(meta, surah, ayahEnd)
  const globalAyahIdStart = toGlobalAyahId(meta, surah, ayahStart)
  const currentLastGlobalId =
    current.lastSurah && current.lastAyah ? toGlobalAyahId(meta, current.lastSurah, current.lastAyah) : 0

  const newlyCoveredJuz = computeNewlyCoveredJuz(meta, globalAyahIdStart, globalAyahId)
  const completedJuz = Array.from(new Set([...current.completedJuz, ...newlyCoveredJuz])).sort((a, b) => a - b)

  const today = localDateKey(new Date())
  let currentStreakCount = current.currentStreakCount
  let longestStreak = current.longestStreak
  if (current.streakLastDate !== today) {
    currentStreakCount = current.streakLastDate && isYesterday(current.streakLastDate) ? currentStreakCount + 1 : 1
    longestStreak = Math.max(longestStreak, currentStreakCount)
  }

  const next = {
    lastSurah: surah,
    lastAyah: ayahEnd,
    lastReadAt: now,
    completedJuz,
    totalAyahsRead: current.totalAyahsRead + Math.max(0, ayahEnd - ayahStart + 1),
    currentStreakCount,
    longestStreak,
    streakLastDate: today,
  }
  await quranProgressRepo.set(next)
  useQuranProgressStore.getState().setProgress(next)

  return { progress: next, advanced: globalAyahId > currentLastGlobalId }
}
