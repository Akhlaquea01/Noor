import { useEffect, useState } from 'react'
import { useLocation } from '../../../shared/hooks/useLocation'
import { usePreferencesStore } from '../../../shared/state/preferencesStore'
import { calculatePrayerTimes, getNextPrayer } from '../lib/calculatePrayerTimes'
import type { DailyPrayerTimes, PrayerName } from '../lib/calculatePrayerTimes'

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// Determines which calendar day to calculate prayer times for. For a
// manually-entered location, "today" must be the location's own local day,
// not the device's — otherwise near midnight the wrong day's times could be
// computed. Constructing noon-UTC on that day (rather than passing the
// shifted instant directly) avoids any ambiguity in how the underlying
// calculation library extracts a calendar day from a Date.
function resolveCalculationDate(now: Date, utcOffsetHours: number | null): Date {
  if (utcOffsetHours === null) return now
  const shifted = new Date(now.getTime() + utcOffsetHours * 60 * 60_000)
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), 12))
}

export function useNextPrayer() {
  const { location, source, loading: locationLoading, error } = useLocation()
  const { calculationMethod, madhab, locationMode, manualLocation } = usePreferencesStore((s) => s.preferences)
  const [now, setNow] = useState(() => new Date())

  const utcOffsetHours = locationMode === 'manual' ? (manualLocation?.utcOffsetHours ?? null) : null

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  if (!location) {
    return { todayTimes: null, nextPrayer: null, locationSource: source, loading: locationLoading, error, utcOffsetHours }
  }

  const calcDate = resolveCalculationDate(now, utcOffsetHours)
  const todayTimes = calculatePrayerTimes(location, calcDate, calculationMethod, madhab)
  let nextPrayer: { name: PrayerName; time: Date } | null = getNextPrayer(todayTimes, now)
  if (!nextPrayer) {
    const tomorrowTimes = calculatePrayerTimes(location, addDays(calcDate, 1), calculationMethod, madhab)
    nextPrayer = { name: 'fajr', time: tomorrowTimes.fajr }
  }

  return { todayTimes, nextPrayer, locationSource: source, loading: locationLoading, error, now, utcOffsetHours }
}

export function formatCountdown(target: Date, now: Date): string {
  const diffMs = Math.max(0, target.getTime() - now.getTime())
  const totalMinutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export type { DailyPrayerTimes }
