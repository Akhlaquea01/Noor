import { Volume2, VolumeX } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import './ListenButton.css'

interface ListenButtonProps {
  text: string
  lang?: string
  label?: string
}

// "Play"/"Listen" option for content with no recorded audio (Duas, Wudu &
// Salah step recitations) — reads the verified text already shown on
// screen aloud via the browser's speech synthesis. Hides itself rather than
// showing a button that can't work when the platform has no speech engine.
export function ListenButton({ text, lang = 'ar-SA', label = 'Listen' }: ListenButtonProps) {
  const { supported, speaking, speak, cancel } = useSpeech()

  if (!supported) return null

  return (
    <button
      type="button"
      className={`listen-button${speaking ? ' listen-button--active' : ''}`}
      onClick={() => (speaking ? cancel() : speak(text, lang))}
      aria-pressed={speaking}
    >
      {speaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
      {speaking ? 'Stop' : label}
    </button>
  )
}
