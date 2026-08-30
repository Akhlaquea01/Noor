import { Link } from 'react-router-dom'
import { Bell, HardDrive, Accessibility, ChevronRight } from 'lucide-react'
import { GlassCard } from '../shared/ui/GlassCard'
import { usePreferencesStore } from '../shared/state/preferencesStore'
import './SettingsPage.css'

const CALCULATION_METHODS = [
  { value: 'MuslimWorldLeague', label: 'Muslim World League' },
  { value: 'Egyptian', label: 'Egyptian General Authority' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'UmmAlQura', label: 'Umm al-Qura, Makkah' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Turkey', label: 'Diyanet, Turkey' },
  { value: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { value: 'NorthAmerica', label: 'ISNA, North America' },
]

const SETTINGS_LINKS = [
  { to: '/settings/notifications', label: 'Notifications & Reminders', Icon: Bell },
  { to: '/settings/storage', label: 'Storage Manager', Icon: HardDrive },
  { to: '/settings/accessibility', label: 'Accessibility', Icon: Accessibility },
]

export function SettingsPage() {
  const preferences = usePreferencesStore((s) => s.preferences)
  const update = usePreferencesStore((s) => s.update)

  // Merges against the store's live state (via getState(), not the
  // `preferences` closed over at render time) so rapid successive edits —
  // e.g. typing latitude, then tabbing to longitude, then the UTC offset —
  // can't clobber each other. Each of those fields previously rebuilt the
  // whole manualLocation object from render-time `preferences`, which could
  // still be missing the field just set by the previous keystroke if this
  // component hadn't re-rendered yet.
  const updateManualLocation = (patch: Partial<NonNullable<typeof preferences.manualLocation>>) => {
    const current = usePreferencesStore.getState().preferences.manualLocation
    void update({ manualLocation: { lat: current?.lat ?? 0, lng: current?.lng ?? 0, ...current, ...patch } })
  }

  const updateDailyGoal = (patch: Partial<typeof preferences.dailyGoal>) => {
    const current = usePreferencesStore.getState().preferences.dailyGoal
    void update({ dailyGoal: { ...current, ...patch } })
  }

  return (
    <section className="settings-page">
      <h1>Settings</h1>

      <GlassCard as="section" className="settings-page__section">
        <h2>Appearance</h2>
        <label className="settings-page__field">
          <span>Theme</span>
          <select
            value={preferences.theme}
            onChange={(e) => void update({ theme: e.target.value as typeof preferences.theme })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </GlassCard>

      <GlassCard as="section" className="settings-page__section">
        <h2>Prayer Calculation</h2>
        <label className="settings-page__field">
          <span>Calculation method</span>
          <select
            value={preferences.calculationMethod}
            onChange={(e) => void update({ calculationMethod: e.target.value })}
          >
            {CALCULATION_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-page__field">
          <span>Madhab (Asr calculation)</span>
          <select
            value={preferences.madhab}
            onChange={(e) => void update({ madhab: e.target.value as typeof preferences.madhab })}
          >
            <option value="shafi">Standard (Shafi, Maliki, Hanbali)</option>
            <option value="hanafi">Hanafi</option>
          </select>
        </label>
        <label className="settings-page__field">
          <span>Location</span>
          <select
            value={preferences.locationMode}
            onChange={(e) => void update({ locationMode: e.target.value as typeof preferences.locationMode })}
          >
            <option value="gps">Use device location</option>
            <option value="manual">Set manually</option>
          </select>
        </label>
        {preferences.locationMode === 'manual' && (
          <>
            <label className="settings-page__field">
              <span>City (label only)</span>
              <input
                type="text"
                placeholder="e.g. Cairo"
                value={preferences.manualLocation?.city ?? ''}
                onChange={(e) => updateManualLocation({ city: e.target.value })}
              />
            </label>
            <label className="settings-page__field">
              <span>Latitude / Longitude</span>
              <div className="settings-page__field-row">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={preferences.manualLocation?.lat ?? ''}
                  onChange={(e) => updateManualLocation({ lat: Number(e.target.value) || 0 })}
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={preferences.manualLocation?.lng ?? ''}
                  onChange={(e) => updateManualLocation({ lng: Number(e.target.value) || 0 })}
                />
              </div>
            </label>
            <label className="settings-page__field">
              <span>UTC offset (hours)</span>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 1 for UK summer time"
                value={preferences.manualLocation?.utcOffsetHours ?? ''}
                onChange={(e) =>
                  updateManualLocation({ utcOffsetHours: e.target.value === '' ? undefined : Number(e.target.value) })
                }
              />
              <span className="settings-page__hint">
                Needed to show prayer times in the location's own time, not this device's.
              </span>
            </label>
          </>
        )}
      </GlassCard>

      <GlassCard as="section" className="settings-page__section">
        <h2>Quran Reading</h2>
        <label className="settings-page__field">
          <span>Daily goal</span>
          <div className="settings-page__field-row">
            <input
              type="number"
              min={1}
              value={preferences.dailyGoal.amount}
              onChange={(e) => updateDailyGoal({ amount: Number(e.target.value) || 1 })}
            />
            <select
              value={preferences.dailyGoal.type}
              onChange={(e) => updateDailyGoal({ type: e.target.value as 'pages' | 'juz' })}
            >
              <option value="pages">pages / day</option>
              <option value="juz">juz / day</option>
            </select>
          </div>
        </label>
        <label className="settings-page__field settings-page__field--toggle">
          <span>Reading streak</span>
          <input
            type="checkbox"
            checked={preferences.streakEnabled}
            onChange={(e) => void update({ streakEnabled: e.target.checked })}
          />
        </label>
        <label className="settings-page__field settings-page__field--toggle">
          <div>
            <span>Autoplay recitation</span>
            <p className="settings-page__hint">
              Automatically play downloaded audio when you open a surah, and continue into the next surah's audio
              when one finishes.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.autoplayAudio}
            onChange={(e) => void update({ autoplayAudio: e.target.checked })}
          />
        </label>
      </GlassCard>

      <GlassCard as="section" className="settings-page__section settings-page__about">
        <h2>About</h2>
        <p>
          Noor is developed by Akhlaque Ahmad. Questions or feedback are welcome at{' '}
          <a href="mailto:akhlaquea01@gmail.com">akhlaquea01@gmail.com</a>.
        </p>
      </GlassCard>

      <GlassCard as="section" className="settings-page__section settings-page__about">
        <h2>Content Sources</h2>
        <p>
          Quran Arabic text, English transliteration, and translation (Saheeh International) via{' '}
          <a href="https://github.com/risan/quran-json" target="_blank" rel="noreferrer">
            quran-json
          </a>{' '}
          (CC BY-SA 4.0), originally sourced from The Noble Qur'an Encyclopedia and Tanzil.net. Juz boundaries via{' '}
          <a href="https://github.com/quran-center/quran-meta" target="_blank" rel="noreferrer">
            quran-meta
          </a>{' '}
          (MIT).
        </p>
      </GlassCard>

      <nav className="settings-page__links" aria-label="More settings">
        {SETTINGS_LINKS.map(({ to, label, Icon }) => (
          <GlassCard key={to} as={Link} to={to} viewTransition interactive className="settings-page__link">
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            <ChevronRight size={16} aria-hidden="true" className="settings-page__link-chevron" />
          </GlassCard>
        ))}
      </nav>
    </section>
  )
}
