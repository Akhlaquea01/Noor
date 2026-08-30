import { Volume2 } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { NotificationCapabilityBanner } from './NotificationCapabilityBanner'
import { useNotificationCapabilities } from './hooks/useNotificationCapabilities'
import { useReminders } from './hooks/useReminders'
import { usePreferencesStore } from '../../shared/state/preferencesStore'
import { playChime } from './lib/chime'
import { PRAYER_LABELS } from '../prayer-times/lib/calculatePrayerTimes'
import type { PrayerName } from '../prayer-times/lib/calculatePrayerTimes'
import type { DailyReminderCategory } from '../../shared/db/types'
import './SettingsNotificationsPage.css'

const PRAYERS = Object.keys(PRAYER_LABELS) as PrayerName[]

const DAILY_CATEGORIES: { id: DailyReminderCategory; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning', hint: 'Morning Adhkar & Quran' },
  { id: 'evening', label: 'Evening', hint: 'Evening Adhkar & Quran' },
  { id: 'night', label: 'Night', hint: 'Isha & Sleep Dua' },
]

export function SettingsNotificationsPage() {
  const { capabilities } = useNotificationCapabilities()
  const { get, upsert } = useReminders()
  const notificationSound = usePreferencesStore((s) => s.preferences.notificationSound)
  const updatePreferences = usePreferencesStore((s) => s.update)
  const disabled = capabilities.tier !== 'full' || capabilities.permission !== 'granted'

  return (
    <section className="settings-notifications-page">
      <h1>Notifications & Reminders</h1>

      <NotificationCapabilityBanner />

      <GlassCard as="section" className="settings-notifications-page__section">
        <div className="settings-notifications-page__row">
          <div className="settings-notifications-page__row-label">
            <strong>Notification sound</strong>
            <span>A short chime plays alongside prayer and daily reminders.</span>
          </div>
          <input
            type="checkbox"
            checked={notificationSound}
            onChange={(e) => void updatePreferences({ notificationSound: e.target.checked })}
            aria-label="Notification sound"
          />
        </div>
        <button type="button" className="settings-notifications-page__preview" onClick={() => void playChime()}>
          <Volume2 size={14} aria-hidden="true" /> Preview sound
        </button>
      </GlassCard>

      <GlassCard as="section" className="settings-notifications-page__section">
        <h2>Prayer Notifications</h2>
        {PRAYERS.map((prayer) => {
          const reminder = get('prayer', prayer)
          return (
            <div key={prayer} className="settings-notifications-page__row">
              <div className="settings-notifications-page__row-label">
                <strong>{PRAYER_LABELS[prayer]}</strong>
                {reminder?.enabled && (
                  <select
                    disabled={disabled}
                    value={reminder.offsetMinutes}
                    onChange={(e) => void upsert('prayer', prayer, { offsetMinutes: Number(e.target.value) })}
                  >
                    <option value={0}>At prayer time</option>
                    <option value={-5}>5 min before</option>
                    <option value={-10}>10 min before</option>
                    <option value={-15}>15 min before</option>
                  </select>
                )}
              </div>
              <input
                type="checkbox"
                disabled={disabled}
                checked={reminder?.enabled ?? false}
                onChange={(e) => void upsert('prayer', prayer, { enabled: e.target.checked })}
                aria-label={`${PRAYER_LABELS[prayer]} notification`}
              />
            </div>
          )
        })}
      </GlassCard>

      <GlassCard as="section" className="settings-notifications-page__section">
        <h2>Prayer Log Reminders</h2>
        <p className="settings-notifications-page__section-hint">
          A nudge to log a prayer if it's still unmarked a while after its time — cancels itself the moment you log
          it.
        </p>
        {PRAYERS.map((prayer) => {
          const reminder = get('prayer-log', prayer)
          return (
            <div key={prayer} className="settings-notifications-page__row">
              <div className="settings-notifications-page__row-label">
                <strong>{PRAYER_LABELS[prayer]}</strong>
                {reminder?.enabled && (
                  <select
                    disabled={disabled}
                    value={reminder.offsetMinutes}
                    onChange={(e) => void upsert('prayer-log', prayer, { offsetMinutes: Number(e.target.value) })}
                  >
                    <option value={15}>15 min after</option>
                    <option value={30}>30 min after</option>
                    <option value={60}>60 min after</option>
                  </select>
                )}
              </div>
              <input
                type="checkbox"
                disabled={disabled}
                checked={reminder?.enabled ?? false}
                onChange={(e) =>
                  void upsert('prayer-log', prayer, {
                    enabled: e.target.checked,
                    offsetMinutes: reminder?.offsetMinutes || 30,
                  })
                }
                aria-label={`${PRAYER_LABELS[prayer]} log reminder`}
              />
            </div>
          )
        })}
      </GlassCard>

      <GlassCard as="section" className="settings-notifications-page__section">
        <h2>Daily Reminders</h2>
        {DAILY_CATEGORIES.map((cat) => {
          const reminder = get('daily', cat.id)
          return (
            <div key={cat.id} className="settings-notifications-page__row">
              <div className="settings-notifications-page__row-label">
                <strong>{cat.label}</strong>
                <span>{cat.hint}</span>
              </div>
              <input
                type="checkbox"
                disabled={disabled}
                checked={reminder?.enabled ?? false}
                onChange={(e) => void upsert('daily', cat.id, { enabled: e.target.checked })}
                aria-label={`${cat.label} reminder`}
              />
            </div>
          )
        })}
      </GlassCard>
    </section>
  )
}
