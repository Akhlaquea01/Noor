import { Volume2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { useAvailableVoices } from '../hooks/useAvailableVoices'
import { detectOs } from '../lib/detectOs'
import './VoiceLanguageCard.css'

// Web pages cannot install an OS-level text-to-speech voice — there is no
// browser API for that (deliberately, for security/sandboxing). What we
// *can* do is what the rest of Noor already does for other platform
// capabilities: detect whether an Arabic voice is present, and if not,
// point at exactly where to install one in this device's own settings,
// with a way to re-check afterward. This exists because the "Listen"
// buttons throughout the app depend on the device having an Arabic voice —
// without one, they still play, just poorly (an English voice reading
// Arabic phonetically).
const INSTRUCTIONS: Record<string, { title: string; steps: string[] }> = {
  windows: {
    title: 'Windows',
    steps: [
      'Open Settings → Time & Language → Language & region',
      'Select "Add a language" and choose Arabic',
      'Open Settings → Time & Language → Speech → Manage voices, and add an Arabic voice',
    ],
  },
  macos: {
    title: 'macOS',
    steps: [
      'Open System Settings → Accessibility → Spoken Content',
      'Open "System Voice" → Manage Voices',
      'Find Arabic and download a voice',
    ],
  },
  ios: {
    title: 'iPhone / iPad',
    steps: [
      'Open Settings → Accessibility → Spoken Content',
      'Open "Voices" → Arabic',
      'Download a voice',
    ],
  },
  android: {
    title: 'Android',
    steps: [
      'Open Settings → System → Languages & input → Text-to-speech output',
      'Open the settings for your speech engine (e.g. Google)',
      'Open "Install voice data" and download Arabic',
    ],
  },
  other: {
    title: 'This device',
    steps: [
      'Look for a "Text-to-speech" or "Speech" section in your system settings',
      'Add or download an Arabic voice from there',
    ],
  },
}

export function VoiceLanguageCard() {
  const { supported, hasVoiceForLang, recheck } = useAvailableVoices()
  const os = detectOs()
  const hasArabic = hasVoiceForLang('ar')
  const instructions = INSTRUCTIONS[os] ?? INSTRUCTIONS.other

  if (!supported) {
    return (
      <GlassCard as="section" className="voice-language-card">
        <h2>Recitation voice</h2>
        <p className="voice-language-card__note">
          Speech playback isn't available in this browser, so "Listen" buttons won't appear anywhere in Noor.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard as="section" className="voice-language-card">
      <h2>Recitation voice</h2>
      <p className="voice-language-card__note">
        The "Listen" buttons on Duas and step recitations use your device's own text-to-speech voices — Noor can't
        install one for you (browsers don't allow that), but it can tell you where to get one.
      </p>

      {hasArabic ? (
        <div className="voice-language-card__status voice-language-card__status--ok">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>An Arabic voice is installed on this device.</span>
        </div>
      ) : (
        <>
          <div className="voice-language-card__status voice-language-card__status--warn">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>No Arabic voice found — Listen will still play, using whatever voice is installed instead.</span>
          </div>
          <div className="voice-language-card__instructions">
            <strong>
              <Volume2 size={14} aria-hidden="true" /> Add one on {instructions.title}
            </strong>
            <ol>
              {instructions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </>
      )}

      <button type="button" className="voice-language-card__recheck" onClick={recheck}>
        <RefreshCw size={14} aria-hidden="true" /> Check again
      </button>
    </GlassCard>
  )
}
