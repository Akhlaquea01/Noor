import type { PrayerName } from '../../../shared/db/types'

export function prayerLogKey(dateKey: string, prayer: PrayerName): string {
  return `${dateKey}:${prayer}`
}
