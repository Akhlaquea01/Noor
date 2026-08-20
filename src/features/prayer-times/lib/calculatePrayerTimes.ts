import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes, Madhab, HighLatitudeRule, PolarCircleResolution } from 'adhan'
import type { GeoPoint } from '../../../shared/hooks/useLocation'

export interface DailyPrayerTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

// Isolates the `adhan` dependency behind this module — swappable without
// touching feature code. Pure local astronomical calculation: no network
// call, works fully offline given only coordinates + date + settings.
export function calculatePrayerTimes(
  location: GeoPoint,
  date: Date,
  calculationMethod: string,
  madhab: 'shafi' | 'hanafi'
): DailyPrayerTimes {
  const coordinates = new Coordinates(location.lat, location.lng)
  const methodFn = (CalculationMethod as Record<string, () => CalculationParameters>)[calculationMethod]
  const params = (methodFn ?? CalculationMethod.MuslimWorldLeague)()
  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  // Unset, these default to a fixed rule regardless of latitude and to
  // leaving polar-circle cases unresolved — at high latitudes (northern
  // Europe/Canada, etc.) where true astronomical twilight may not occur for
  // weeks at a time, that can silently produce an Invalid Date for Fajr or
  // Isha with no fallback. `recommended()` picks the right rule for the
  // given latitude, and AqrabYaum approximates from the nearest resolvable
  // day inside the Arctic/Antarctic circle instead of returning nothing.
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates)
  params.polarCircleResolution = PolarCircleResolution.AqrabYaum

  const times = new PrayerTimes(coordinates, date, params)
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }
}

export function getNextPrayer(times: DailyPrayerTimes, now: Date): { name: PrayerName; time: Date } | null {
  for (const name of PRAYER_ORDER) {
    if (times[name] > now) return { name, time: times[name] }
  }
  return null
}

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}
