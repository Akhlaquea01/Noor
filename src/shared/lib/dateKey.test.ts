import { describe, it, expect } from 'vitest'
import { localDateKey } from './dateKey'

describe('localDateKey', () => {
  it('uses local calendar fields, not the UTC date toISOString() would give', () => {
    // 11:30pm on Jan 1 local time is already Jan 2 in UTC+X timezones ahead
    // of the local one, and still Jan 1 in timezones behind it — the point
    // is that this must always match the *local* wall-clock day regardless
    // of the machine's own timezone, which toISOString() cannot do.
    const localMidnightEve = new Date(2026, 0, 1, 23, 30) // constructed from local fields
    expect(localDateKey(localMidnightEve)).toBe('2026-01-01')
  })

  it('pads single-digit month and day', () => {
    expect(localDateKey(new Date(2026, 2, 5))).toBe('2026-03-05')
  })

  it('rolls over correctly across a local midnight boundary', () => {
    const justBeforeMidnight = new Date(2026, 5, 15, 23, 59, 59)
    const justAfterMidnight = new Date(2026, 5, 16, 0, 0, 1)
    expect(localDateKey(justBeforeMidnight)).toBe('2026-06-15')
    expect(localDateKey(justAfterMidnight)).toBe('2026-06-16')
  })
})
