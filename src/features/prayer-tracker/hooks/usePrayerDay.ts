import { useCallback, useEffect, useState } from 'react'
import { useLocation } from '../../../shared/hooks/useLocation'
import { usePreferencesStore } from '../../../shared/state/preferencesStore'
import { calculatePrayerTimes } from '../../prayer-times/lib/calculatePrayerTimes'
import type { DailyPrayerTimes, PrayerName } from '../../prayer-times/lib/calculatePrayerTimes'
import { prayerLogRepo } from '../../../shared/db/repositories'
import { createSyncMeta } from '../../../shared/db/syncMeta'
import { localDateKey } from '../../../shared/lib/dateKey'
import { prayerLogKey } from '../lib/prayerLogKey'
import { deriveDayPrayerStatus } from '../lib/derivePrayerStatus'
import type { PrayerStatus } from '../lib/derivePrayerStatus'
import { advancePrayerStreak } from '../lib/prayerStreak'

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

interface UsePrayerDayResult {
  dateKey: string
  times: DailyPrayerTimes | null
  statuses: Record<PrayerName, PrayerStatus> | null
  canLog: Record<PrayerName, boolean> | null
  prayedCount: number
  loaded: boolean
  locationLoading: boolean
  locationError: string | null
  utcOffsetHours: number | null
  toggle: (prayer: PrayerName) => Promise<void>
}

// Supports any calendar day, not just today — the calendar lets a user tap
// and log a past day's prayers retroactively. Mirrors usePilgrimageSection
// (Hajj/Umrah checklist) for the persistence half; the derivation half is
// handled by deriveDayPrayerStatus so this hook stays about data-fetching
// and writes, not status logic.
export function usePrayerDay(date: Date): UsePrayerDayResult {
  const dateKey = localDateKey(date)
  const { location, loading: locationLoading, error: locationError } = useLocation()
  const { calculationMethod, madhab, locationMode, manualLocation } = usePreferencesStore((s) => s.preferences)
  const utcOffsetHours = locationMode === 'manual' ? (manualLocation?.utcOffsetHours ?? null) : null

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const [times, setTimes] = useState<DailyPrayerTimes | null>(null)
  const [nextDayFajr, setNextDayFajr] = useState<Date | null>(null)
  const [loggedPrayers, setLoggedPrayers] = useState<Set<PrayerName>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!location) return
    setTimes(calculatePrayerTimes(location, date, calculationMethod, madhab))
    setNextDayFajr(calculatePrayerTimes(location, addDays(date, 1), calculationMethod, madhab).fajr)
  }, [date, dateKey, location, calculationMethod, madhab])

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    void prayerLogRepo.listByIndex('byDate', dateKey).then((records) => {
      if (cancelled) return
      setLoggedPrayers(new Set(records.map((r) => r.prayerName)))
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [dateKey])

  const toggle = useCallback(
    async (prayer: PrayerName) => {
      const key = prayerLogKey(dateKey, prayer)
      const isPrayed = loggedPrayers.has(prayer)
      if (isPrayed) {
        await prayerLogRepo.remove(key)
        setLoggedPrayers((prev) => {
          const next = new Set(prev)
          next.delete(prayer)
          return next
        })
        return
      }
      await prayerLogRepo.put(key, { ...createSyncMeta(), dateKey, prayerName: prayer, prayedAt: Date.now() })
      const next = new Set(loggedPrayers)
      next.add(prayer)
      setLoggedPrayers(next)
      if (next.size === 5) await advancePrayerStreak(dateKey)
    },
    [dateKey, loggedPrayers]
  )

  const derived =
    times && nextDayFajr ? deriveDayPrayerStatus({ times, nextDayFajr, loggedPrayers, now }) : null

  return {
    dateKey,
    times,
    statuses: derived?.statuses ?? null,
    canLog: derived?.canLog ?? null,
    prayedCount: derived?.prayedCount ?? 0,
    loaded,
    locationLoading,
    locationError,
    utcOffsetHours,
    toggle,
  }
}
