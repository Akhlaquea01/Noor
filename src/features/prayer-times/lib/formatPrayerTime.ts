const utcFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
const deviceFormatter = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' })

// A manually-entered location's wall-clock time must be computed from its
// own UTC offset, not the device's ambient timezone — `Intl.DateTimeFormat`
// has no way to accept a raw offset, so shift the instant by the offset and
// then format it as UTC, which cancels out any further local conversion.
export function formatPrayerTime(date: Date, utcOffsetHours: number | null): string {
  if (utcOffsetHours === null) return deviceFormatter.format(date)
  const shifted = new Date(date.getTime() + utcOffsetHours * 60 * 60_000)
  return utcFormatter.format(shifted)
}
