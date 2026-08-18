import { useEffect, useState } from 'react'

// speechSynthesis.getVoices() is often empty on first call — many browsers
// load the voice list asynchronously and fire 'voiceschanged' once it's
// ready, so this re-reads on that event rather than trusting a single
// synchronous snapshot.
export function useAvailableVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []
  )
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    const refresh = () => setVoices(window.speechSynthesis.getVoices())
    refresh()
    window.speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh)
  }, [supported])

  const hasVoiceForLang = (langPrefix: string) => voices.some((v) => v.lang.toLowerCase().startsWith(langPrefix))

  return { supported, voices, hasVoiceForLang, recheck: () => setVoices(window.speechSynthesis.getVoices()) }
}
