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
  afternoon: 13,
  evening: 18,
  night: 21,
}

const DAILY_MESSAGES: Record<DailyReminderCategory, string> = {
  morning: 'Time for Morning Adhkar and a moment with the Qur\'an.',
  afternoon: 'A gentle reminder for Salah and dhikr.',
  evening: 'Time for Evening Adhkar and a moment with the Qur\'an.',
  night: 'Time for Isha and the Sleep Dua.',
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
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
      const today = todayKey()
      const reminders = await remindersRepo.list()

      if (location) {
        const times = calculatePrayerTimes(location, now, calculationMethod, madhab)
        for (const prayer of Object.keys(PRAYER_LABELS) as PrayerName[]) {
          const reminder = reminders.find((r) => r.kind === 'prayer' && r.prayerName === prayer)
          if (!reminder?.enabled) continue
          const alreadyFiredToday = reminder.lastFiredAt && new Date(reminder.lastFiredAt).toISOString().slice(0, 10) === today
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
        const alreadyFiredToday = reminder.lastFiredAt && new Date(reminder.lastFiredAt).toISOString().slice(0, 10) === today
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
