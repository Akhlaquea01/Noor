import { describe, it, expect } from 'vitest'
import { derivePrayerStatus, canLogPrayer, deriveDayPrayerStatus } from './derivePrayerStatus'
import type { DailyPrayerTimes } from '../../prayer-times/lib/calculatePrayerTimes'

function hm(h: number, m = 0): Date {
  return new Date(2026, 0, 15, h, m)
}

const TIMES: DailyPrayerTimes = {
  fajr: hm(5),
  sunrise: hm(6, 30),
  dhuhr: hm(12, 30),
  asr: hm(16),
  maghrib: hm(18, 30),
  isha: hm(20),
}
const NEXT_DAY_FAJR = new Date(2026, 0, 16, 5, 0)

describe('derivePrayerStatus', () => {
  it('is pending before the prayer\'s own time starts', () => {
    const status = derivePrayerStatus({
      prayerName: 'dhuhr',
      prayerTimes: TIMES,
      nextPrayerTime: TIMES.asr,
      isPrayed: false,
      now: hm(10),
    })
    expect(status).toBe('pending')
  })

  it('is pending while inside its own window, not yet logged', () => {
    const status = derivePrayerStatus({
      prayerName: 'dhuhr',
      prayerTimes: TIMES,
      nextPrayerTime: TIMES.asr,
      isPrayed: false,
      now: hm(14),
    })
    expect(status).toBe('pending')
  })

  it('is missed once the next prayer\'s window opens, unlogged', () => {
    const status = derivePrayerStatus({
      prayerName: 'dhuhr',
      prayerTimes: TIMES,
      nextPrayerTime: TIMES.asr,
      isPrayed: false,
      now: hm(16, 1),
    })
    expect(status).toBe('missed')
  })

  it('is prayed regardless of timing once logged', () => {
    const status = derivePrayerStatus({
      prayerName: 'dhuhr',
      prayerTimes: TIMES,
      nextPrayerTime: TIMES.asr,
      isPrayed: true,
      now: hm(2), // even "before" its own time — a logged record always wins
    })
    expect(status).toBe('prayed')
  })
})

describe('canLogPrayer', () => {
  it('is false before the prayer\'s time starts', () => {
    expect(canLogPrayer(TIMES, 'asr', hm(15))).toBe(false)
  })

  it('is true once the prayer\'s time has started, even long after', () => {
    expect(canLogPrayer(TIMES, 'asr', hm(16))).toBe(true)
    expect(canLogPrayer(TIMES, 'asr', hm(23))).toBe(true)
  })
})

describe('deriveDayPrayerStatus', () => {
  it('uses next-day Fajr as Isha\'s missed boundary', () => {
    const beforeNextFajr = new Date(2026, 0, 16, 4, 0)
    const afterNextFajr = new Date(2026, 0, 16, 5, 1)

    const stillPending = deriveDayPrayerStatus({
      times: TIMES,
      nextDayFajr: NEXT_DAY_FAJR,
      loggedPrayers: new Set(),
      now: beforeNextFajr,
    })
    expect(stillPending.statuses.isha).toBe('pending')

    const nowMissed = deriveDayPrayerStatus({
      times: TIMES,
      nextDayFajr: NEXT_DAY_FAJR,
      loggedPrayers: new Set(),
      now: afterNextFajr,
    })
    expect(nowMissed.statuses.isha).toBe('missed')
  })

  it('counts only prayed prayers, ignoring pending/missed', () => {
    // now = 6am the next day, i.e. past next-day Fajr — Isha's window (which
    // legitimately extends until Fajr, not midnight) has closed by now too.
    const result = deriveDayPrayerStatus({
      times: TIMES,
      nextDayFajr: NEXT_DAY_FAJR,
      loggedPrayers: new Set(['fajr', 'dhuhr']),
      now: new Date(2026, 0, 16, 6, 0),
    })
    expect(result.prayedCount).toBe(2)
    expect(result.statuses.fajr).toBe('prayed')
    expect(result.statuses.dhuhr).toBe('prayed')
    expect(result.statuses.asr).toBe('missed')
    expect(result.statuses.maghrib).toBe('missed')
    expect(result.statuses.isha).toBe('missed')
  })
})
