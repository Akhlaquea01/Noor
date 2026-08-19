import { useEffect } from 'react'
import { useLocation } from '../../../shared/hooks/useLocation'
import { usePreferencesStore } from '../../../shared/state/preferencesStore'
import { remindersRepo } from '../../../shared/db/repositories'
import { touchSyncMeta } from '../../../shared/db/syncMeta'
import { calculatePrayerTimes, PRAYER_LABELS } from '../../prayer-times/lib/calculatePrayerTimes'
import type { PrayerName } from '../../prayer-times/lib/calculatePrayerTimes'
import { detectCapabilities } from '../lib/capabilities'
import type { DailyReminderCategory } from '../../../shared/db/types'

const DAILY_TRIGGER_HOURS: Record<DailyReminderCategory, number> = {
  morning: 7,
  evening: 18,
  night: 21,
}

const DAILY_MESSAGES: Record<DailyReminderCategory, string> = {
  morning: 'Time for Morning Adhkar and a moment with the Qur\'an.',
  evening: 'Time for Evening Adhkar and a moment with the Qur\'an.',
  night: 'Time for Isha and the Sleep Dua.',
}

// Local calendar day, not UTC — toISOString() would compare the wrong day
// for anyone far from UTC (e.g. it rolls over at 5:30pm local time in
// India, 2pm in New York), which could double-fire or skip a reminder near
// that boundary. getHours() below is already local for the same reason.
function todayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function showReminder(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) {
    await registration.showNotification(title, { body, icon: '/icons/icon-192.png' })
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  }
}

// Local-only scheduling: since there's no push server, reminders can only
// fire while the app is open and this timer is running — a real limitation
// of the web platform without a backend, not something this loop can fix.
// It's surfaced honestly via the capability banner rather than hidden.
export function useNotificationScheduler() {
  const { location } = useLocation()
  const { calculationMethod, madhab } = usePreferencesStore((s) => s.preferences)

  useEffect(() => {
    const check = async () => {
      if (detectCapabilities().tier === 'unsupported') return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

      const now = new Date()
      const today = todayKey(now)
      const reminders = await remindersRepo.list()

      if (location) {
        const times = calculatePrayerTimes(location, now, calculationMethod, madhab)
        for (const prayer of Object.keys(PRAYER_LABELS) as PrayerName[]) {
          const reminder = reminders.find((r) => r.kind === 'prayer' && r.prayerName === prayer)
          if (!reminder?.enabled) continue
          const alreadyFiredToday = reminder.lastFiredAt && todayKey(new Date(reminder.lastFiredAt)) === today
          if (alreadyFiredToday) continue
          const triggerAt = new Date(times[prayer].getTime() + reminder.offsetMinutes * 60_000)
          if (now >= triggerAt && now.getTime() - triggerAt.getTime() < 15 * 60_000) {
            await showReminder(`🕌 ${PRAYER_LABELS[prayer]}`, `It is time for ${PRAYER_LABELS[prayer]}.`)
            const key = `prayer:${prayer}`
            await remindersRepo.put(key, touchSyncMeta({ ...reminder, lastFiredAt: now.getTime() }))
          }
        }
      }

      for (const category of Object.keys(DAILY_TRIGGER_HOURS) as DailyReminderCategory[]) {
        const reminder = reminders.find((r) => r.kind === 'daily' && r.dailyCategory === category)
        if (!reminder?.enabled) continue
        const alreadyFiredToday = reminder.lastFiredAt && todayKey(new Date(reminder.lastFiredAt)) === today
        if (alreadyFiredToday) continue
        if (now.getHours() >= DAILY_TRIGGER_HOURS[category]) {
          await showReminder('Noor', DAILY_MESSAGES[category])
          const key = `daily:${category}`
          await remindersRepo.put(key, touchSyncMeta({ ...reminder, lastFiredAt: now.getTime() }))
        }
      }
    }

    void check()
    const interval = setInterval(() => void check(), 60_000)
    return () => clearInterval(interval)
  }, [location, calculationMethod, madhab])
}
