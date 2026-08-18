import { usePreferencesStore } from '../shared/state/preferencesStore'
import { GlassCard } from '../shared/ui/GlassCard'
import { VoiceLanguageCard } from '../shared/ui/VoiceLanguageCard'
import './SettingsAccessibilityPage.css'

const FONT_SCALES = [
  { value: 0.9, label: 'Small' },
  { value: 1, label: 'Default' },
  { value: 1.15, label: 'Large' },
  { value: 1.3, label: 'Extra Large' },
]

export function SettingsAccessibilityPage() {
  const preferences = usePreferencesStore((s) => s.preferences)
  const update = usePreferencesStore((s) => s.update)

  return (
    <section className="settings-accessibility-page">
      <h1>Accessibility</h1>

      <GlassCard as="section" className="settings-accessibility-page__section">
        <h2>Text size</h2>
        <div className="settings-accessibility-page__scale-options" role="radiogroup" aria-label="Text size">
          {FONT_SCALES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={preferences.fontScale === option.value}
              className={`settings-accessibility-page__scale-option${preferences.fontScale === option.value ? ' settings-accessibility-page__scale-option--active' : ''}`}
              style={{ fontSize: `${option.value}rem` }}
              onClick={() => void update({ fontScale: option.value })}
            >
              Aa
            </button>
          ))}
        </div>
        <p className="settings-accessibility-page__hint">
          {FONT_SCALES.find((o) => o.value === preferences.fontScale)?.label ?? 'Default'}
        </p>
      </GlassCard>

      <GlassCard as="section" className="settings-accessibility-page__section">
        <h2>Display</h2>
        <label className="settings-accessibility-page__toggle-row">
          <div>
            <strong>High contrast</strong>
            <p>Increases text and border contrast throughout the app.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => void update({ highContrast: e.target.checked })}
          />
        </label>
        <label className="settings-accessibility-page__toggle-row">
          <div>
            <strong>Reduce motion</strong>
            <p>Turns off animations and transitions. Also follows your device's motion setting automatically.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => void update({ reducedMotion: e.target.checked })}
          />
        </label>
      </GlassCard>

      <VoiceLanguageCard />
    </section>
  )
}
