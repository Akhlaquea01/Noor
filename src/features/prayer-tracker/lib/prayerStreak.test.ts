import { describe, it, expect, beforeEach } from 'vitest'
import { advancePrayerStreak } from './prayerStreak'
import { prayerStreakRepo } from '../../../shared/db/repositories'
import { DEFAULT_PRAYER_STREAK } from '../../../shared/db/types'

describe('advancePrayerStreak', () => {
  beforeEach(async () => {
    await prayerStreakRepo.set(DEFAULT_PRAYER_STREAK)
  })

  it('starts a streak at 1 for the first completed day', async () => {
    const result = await advancePrayerStreak('2026-01-10')
    expect(result.currentStreakCount).toBe(1)
    expect(result.longestStreak).toBe(1)
    expect(result.streakLastDate).toBe('2026-01-10')
  })

  it('is a no-op when completing the same day twice', async () => {
    await advancePrayerStreak('2026-01-10')
    const result = await advancePrayerStreak('2026-01-10')
    expect(result.currentStreakCount).toBe(1)
  })

  it('increments when the completed day is immediately after the streak anchor', async () => {
    await advancePrayerStreak('2026-01-10')
    const result = await advancePrayerStreak('2026-01-11')
    expect(result.currentStreakCount).toBe(2)
    expect(result.longestStreak).toBe(2)
    expect(result.streakLastDate).toBe('2026-01-11')
  })

  it('resets to 1 after a gap, but keeps the prior longestStreak', async () => {
    await advancePrayerStreak('2026-01-10')
    await advancePrayerStreak('2026-01-11')
    // 2026-01-12 skipped
    const result = await advancePrayerStreak('2026-01-13')
    expect(result.currentStreakCount).toBe(1)
    expect(result.longestStreak).toBe(2)
    expect(result.streakLastDate).toBe('2026-01-13')
  })

  it('leaves the streak untouched when retroactively completing a day before the current anchor', async () => {
    await advancePrayerStreak('2026-01-10')
    await advancePrayerStreak('2026-01-11')
    // Backfilling an earlier day (e.g. the user logs a forgotten day from a
    // week ago) must not disturb a streak that has already moved past it.
    const result = await advancePrayerStreak('2026-01-05')
    expect(result.currentStreakCount).toBe(2)
    expect(result.streakLastDate).toBe('2026-01-11')
  })
})
