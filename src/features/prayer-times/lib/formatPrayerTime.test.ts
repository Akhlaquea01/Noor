import { describe, it, expect } from 'vitest'
import { formatPrayerTime } from './formatPrayerTime'

describe('formatPrayerTime', () => {
  it('formats a manual-location UTC offset as that location\'s own wall-clock time, not the device\'s', () => {
    // 2026-08-18T02:28:00Z — this is the exact regression this session hit:
    // a London manual location (UTC+1 in August) displaying in the test
    // runner's own timezone would show the wrong hour entirely.
    const instant = new Date('2026-08-18T02:28:00Z')
    const londonSummerTime = formatPrayerTime(instant, 1)
    expect(londonSummerTime).toBe('3:28 AM')
  })

  it('formats correctly for a negative UTC offset', () => {
    const instant = new Date('2026-08-18T02:28:00Z')
    const newYorkTime = formatPrayerTime(instant, -4)
    expect(newYorkTime).toBe('10:28 PM')
  })

  it('handles a half-hour offset', () => {
    const instant = new Date('2026-08-18T00:00:00Z')
    const indiaTime = formatPrayerTime(instant, 5.5)
    expect(indiaTime).toBe('5:30 AM')
  })

  it('falls back to device-local formatting when offset is null, without throwing', () => {
    const instant = new Date('2026-08-18T02:28:00Z')
    expect(() => formatPrayerTime(instant, null)).not.toThrow()
    expect(formatPrayerTime(instant, null)).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
  })
})
