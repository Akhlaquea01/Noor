import type { DailyPrayerTimes, PrayerName } from '../../prayer-times/lib/calculatePrayerTimes'

export type PrayerStatus = 'prayed' | 'missed' | 'pending'

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

interface DerivePrayerStatusArgs {
  prayerName: PrayerName
  prayerTimes: DailyPrayerTimes
  // Start of the immediately-following prayer — for Isha this is the NEXT
  // calendar day's Fajr, not anything on this same DailyPrayerTimes.
  nextPrayerTime: Date
  isPrayed: boolean
  now: Date
}

// A prayer only becomes "missed" once the *next* prayer's window opens —
// matching how its validity window actually works, not an arbitrary
// timeout. This is independent of canLogPrayer: a prayer stays loggable
// after it's been marked "missed" (someone logging a late-but-real prayer),
// but never before its own time has started (no pre-marking the future).
export function derivePrayerStatus({ prayerTimes, prayerName, nextPrayerTime, isPrayed, now }: DerivePrayerStatusArgs): PrayerStatus {
  if (isPrayed) return 'prayed'
  if (now < prayerTimes[prayerName]) return 'pending'
  if (now >= nextPrayerTime) return 'missed'
  return 'pending'
}

export function canLogPrayer(prayerTimes: DailyPrayerTimes, prayerName: PrayerName, now: Date): boolean {
  return now >= prayerTimes[prayerName]
}

export interface DayPrayerStatus {
  statuses: Record<PrayerName, PrayerStatus>
  canLog: Record<PrayerName, boolean>
  prayedCount: number
}

interface DeriveDayPrayerStatusArgs {
  times: DailyPrayerTimes
  // Next calendar day's Fajr — the boundary that makes Isha "missed".
  nextDayFajr: Date
  loggedPrayers: ReadonlySet<PrayerName>
  now: Date
}

export function deriveDayPrayerStatus({ times, nextDayFajr, loggedPrayers, now }: DeriveDayPrayerStatusArgs): DayPrayerStatus {
  const statuses = {} as Record<PrayerName, PrayerStatus>
  const canLog = {} as Record<PrayerName, boolean>
  PRAYER_ORDER.forEach((name, i) => {
    const nextPrayerTime = i < PRAYER_ORDER.length - 1 ? times[PRAYER_ORDER[i + 1]] : nextDayFajr
    const isPrayed = loggedPrayers.has(name)
    statuses[name] = derivePrayerStatus({ prayerName: name, prayerTimes: times, nextPrayerTime, isPrayed, now })
    canLog[name] = canLogPrayer(times, name, now)
  })
  const prayedCount = PRAYER_ORDER.filter((n) => statuses[n] === 'prayed').length
  return { statuses, canLog, prayedCount }
}
