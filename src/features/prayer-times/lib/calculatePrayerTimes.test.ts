import { describe, it, expect } from 'vitest'
import { calculatePrayerTimes } from './calculatePrayerTimes'

function isValidDate(d: Date): boolean {
  return d instanceof Date && !Number.isNaN(d.getTime())
}

describe('calculatePrayerTimes', () => {
  it('returns valid, ordered times for a typical mid-latitude location', () => {
    const times = calculatePrayerTimes({ lat: 30.0444, lng: 31.2357 }, new Date('2026-06-15T12:00:00Z'), 'Egyptian', 'shafi')
    const order = [times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha]
    for (const t of order) expect(isValidDate(t)).toBe(true)
    for (let i = 1; i < order.length; i++) expect(order[i].getTime()).toBeGreaterThan(order[i - 1].getTime())
  })

  it('returns valid times at a high latitude in summer, where true astronomical twilight may not occur', () => {
    // Reykjavik, Iceland — ~64°N, near-continuous daylight around the summer solstice.
    const times = calculatePrayerTimes({ lat: 64.1466, lng: -21.9426 }, new Date('2026-06-21T12:00:00Z'), 'MuslimWorldLeague', 'shafi')
    for (const t of Object.values(times)) expect(isValidDate(t)).toBe(true)
  })

  it('returns valid times inside the Arctic Circle during the summer solstice (24h daylight)', () => {
    // Svalbard — ~78°N, the sun does not set at all around the solstice, so a
    // naive calculation with no polar-circle resolution can return an
    // Invalid Date for Fajr/Isha instead of an approximated fallback.
    const times = calculatePrayerTimes({ lat: 78.2232, lng: 15.6267 }, new Date('2026-06-21T12:00:00Z'), 'MuslimWorldLeague', 'shafi')
    for (const t of Object.values(times)) expect(isValidDate(t)).toBe(true)
  })

  it('returns valid times inside the Antarctic Circle during winter (24h night)', () => {
    const times = calculatePrayerTimes({ lat: -75.25, lng: -0.07 }, new Date('2026-06-21T12:00:00Z'), 'MuslimWorldLeague', 'shafi')
    for (const t of Object.values(times)) expect(isValidDate(t)).toBe(true)
  })

  it('falls back to Muslim World League for an unrecognized calculation method rather than throwing', () => {
    const times = calculatePrayerTimes({ lat: 51.5074, lng: -0.1278 }, new Date('2026-03-10T12:00:00Z'), 'NotARealMethod', 'shafi')
    expect(isValidDate(times.dhuhr)).toBe(true)
  })
})
