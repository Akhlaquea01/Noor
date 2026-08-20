import { Link } from 'react-router-dom'
import { MapPin, Settings as SettingsIcon } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { useNextPrayer, formatCountdown } from './hooks/useNextPrayer'
import { formatPrayerTime } from './lib/formatPrayerTime'
import { PRAYER_LABELS } from './lib/calculatePrayerTimes'
import type { PrayerName } from './lib/calculatePrayerTimes'
import './PrayerTimesPage.css'

const LOCATION_LABELS: Record<string, string> = {
  gps: 'Current location',
  manual: 'Manual location',
  cached: 'Last known location (offline)',
}

export function PrayerTimesPage() {
  const { todayTimes, nextPrayer, locationSource, loading, error, now, utcOffsetHours } = useNextPrayer()

  return (
    <section className="prayer-times-page">
      <h1>Prayer Times</h1>

      {locationSource && (
        <p className="prayer-times-page__location">
          <MapPin size={14} aria-hidden="true" /> {LOCATION_LABELS[locationSource]}
        </p>
      )}

      {locationSource === 'manual' && (
        <p className="prayer-times-page__manual-note">
          Manual location uses a fixed UTC offset and doesn't adjust for daylight saving time — if this location
          observes DST, times may be off by an hour part of the year.
        </p>
      )}

      {loading && <p className="prayer-times-page__status">Getting location…</p>}
      {error && !todayTimes && (
        <GlassCard className="prayer-times-page__error">
          <p>{error}</p>
          <Link to="/settings">
            <SettingsIcon size={14} aria-hidden="true" /> Set location in Settings
          </Link>
        </GlassCard>
      )}

      {todayTimes && nextPrayer && now && (
        <GlassCard glow="gold" className="prayer-times-page__next">
          <span className="prayer-times-page__next-label">Next: {PRAYER_LABELS[nextPrayer.name]}</span>
          <span className="prayer-times-page__next-time">{formatPrayerTime(nextPrayer.time, utcOffsetHours)}</span>
          <span className="prayer-times-page__next-countdown">in {formatCountdown(nextPrayer.time, now)}</span>
        </GlassCard>
      )}

      {todayTimes && (
        <div className="prayer-times-page__list">
          {(Object.keys(PRAYER_LABELS) as PrayerName[]).map((name) => (
            <GlassCard
              key={name}
              className={`prayer-times-page__row${nextPrayer?.name === name ? ' prayer-times-page__row--active' : ''}`}
            >
              <span>{PRAYER_LABELS[name]}</span>
              <span>{formatPrayerTime(todayTimes[name], utcOffsetHours)}</span>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  )
}
