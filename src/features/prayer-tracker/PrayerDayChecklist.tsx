import { Check, X, Clock } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { usePrayerDay } from './hooks/usePrayerDay'
import { formatPrayerTime } from '../prayer-times/lib/formatPrayerTime'
import { PRAYER_LABELS } from '../prayer-times/lib/calculatePrayerTimes'
import type { PrayerName } from '../prayer-times/lib/calculatePrayerTimes'
import './PrayerDayChecklist.css'

const PRAYERS = Object.keys(PRAYER_LABELS) as PrayerName[]

const dateFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' })

interface PrayerDayChecklistProps {
  date: Date
  // Lets the parent (the calendar grid) refresh its month-completion
  // overlay immediately after a toggle, instead of only on next mount.
  onChange?: () => void
}

export function PrayerDayChecklist({ date, onChange }: PrayerDayChecklistProps) {
  const { times, statuses, canLog, prayedCount, locationLoading, locationError, utcOffsetHours, toggle } =
    usePrayerDay(date)

  return (
    <GlassCard className="prayer-day-checklist">
      <div className="prayer-day-checklist__header">
        <h2>{dateFormatter.format(date)}</h2>
        {statuses && (
          <span className="prayer-day-checklist__count">
            {prayedCount}/{PRAYERS.length} prayed
          </span>
        )}
      </div>

      {!times && (
        <p className="prayer-day-checklist__note">
          {locationLoading ? 'Getting location…' : (locationError ?? 'Set your location to see prayer times')}
        </p>
      )}

      {times && statuses && canLog && (
        <div className="prayer-day-checklist__rows">
          {PRAYERS.map((prayer) => {
            const status = statuses[prayer]
            const disabled = status !== 'prayed' && !canLog[prayer]
            return (
              <button
                key={prayer}
                type="button"
                className={`prayer-day-checklist__row prayer-day-checklist__row--${status}`}
                disabled={disabled}
                onClick={() => {
                  void toggle(prayer).then(() => onChange?.())
                }}
              >
                <span className="prayer-day-checklist__status-icon">
                  {status === 'prayed' && <Check size={14} aria-hidden="true" />}
                  {status === 'missed' && <X size={14} aria-hidden="true" />}
                  {status === 'pending' && <Clock size={14} aria-hidden="true" />}
                </span>
                <span className="prayer-day-checklist__row-label">
                  <strong>{PRAYER_LABELS[prayer]}</strong>
                  <small>{formatPrayerTime(times[prayer], utcOffsetHours)}</small>
                </span>
                <span className="prayer-day-checklist__row-status">
                  {status === 'prayed' ? 'Prayed' : status === 'missed' ? 'Missed' : 'Pending'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
