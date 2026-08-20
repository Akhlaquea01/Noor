import { useEffect } from 'react'
import { useLocation } from '../../../shared/hooks/useLocation'
import { usePreferencesStore } from '../../../shared/state/preferencesStore'
import { remindersRepo } from '../../../shared/db/repositories'
import { touchSyncMeta } from '../../../shared/db/syncMeta'
import { calculatePrayerTimes, PRAYER_LABELS } from '../../prayer-times/lib/calculatePrayerTimes'
import type { PrayerName } from '../../prayer-times/lib/calculatePrayerTimes'
import { detectCapabilities } from '../lib/capabilities'
import { playChime } from '../lib/chime'
import { localDateKey } from '../../../shared/lib/dateKey'
import type { DailyReminderCategory } from '../../../shared/db/types'

// Each category fires only inside its own window, not "any time after the
// start hour" — the bug this replaces: `now.getHours() >= startHour` with no
// upper bound meant that if the app wasn't opened before 7am, the *next*
// time it opened (say, 5:48pm) it would immediately fire "Morning Adhkar"
// then, because the hour-check was still trivially true and the reminder
// hadn't fired yet that day. A missed window should mean "skip today," not
// "fire late and wrong."
const DAILY_WINDOWS: Record<DailyReminderCategory, { start: number; end: number }> = {
  morning: { start: 6, end: 10 },
  evening: { start: 17, end: 19 },
  night: { start: 20, end: 23 },
}

const DAILY_MESSAGES: Record<DailyReminderCategory, string> = {
  morning: 'Time for Morning Adhkar and a moment with the Qur\'an.',
  evening: 'Time for Evening Adhkar and a moment with the Qur\'an.',
  night: 'Time for Isha and the Sleep Dua.',
}

async function showReminder(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) {
    await registration.showNotification(title, { body, icon: '/icons/icon-192.png' })
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  }
  // Read live (not via a hook — this runs from a module-level function, not
  // a component) so a preference change takes effect on the very next
  // reminder without needing the scheduler's effect to re-run.
  if (usePreferencesStore.getState().preferences.notificationSound) {
    void playChime()
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
      const today = localDateKey(now)
      const reminders = await remindersRepo.list()

      if (location) {
        const times = calculatePrayerTimes(location, now, calculationMethod, madhab)
        for (const prayer of Object.keys(PRAYER_LABELS) as PrayerName[]) {
          const reminder = reminders.find((r) => r.kind === 'prayer' && r.prayerName === prayer)
          if (!reminder?.enabled) continue
          const alreadyFiredToday = reminder.lastFiredAt && localDateKey(new Date(reminder.lastFiredAt)) === today
          if (alreadyFiredToday) continue
          const triggerAt = new Date(times[prayer].getTime() + reminder.offsetMinutes * 60_000)
          if (now >= triggerAt && now.getTime() - triggerAt.getTime() < 15 * 60_000) {
            await showReminder(`🕌 ${PRAYER_LABELS[prayer]}`, `It is time for ${PRAYER_LABELS[prayer]}.`)
            const key = `prayer:${prayer}`
            await remindersRepo.put(key, touchSyncMeta({ ...reminder, lastFiredAt: now.getTime() }))
          }
        }
      }

      for (const category of Object.keys(DAILY_WINDOWS) as DailyReminderCategory[]) {
        const reminder = reminders.find((r) => r.kind === 'daily' && r.dailyCategory === category)
        if (!reminder?.enabled) continue
        const alreadyFiredToday = reminder.lastFiredAt && localDateKey(new Date(reminder.lastFiredAt)) === today
        if (alreadyFiredToday) continue
        const { start, end } = DAILY_WINDOWS[category]
        if (now.getHours() >= start && now.getHours() < end) {
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
