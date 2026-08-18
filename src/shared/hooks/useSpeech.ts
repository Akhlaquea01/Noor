import { useEffect, useRef, useState } from 'react'

// Wraps the Web Speech API (SpeechSynthesis) — used for "Listen" buttons on
// content that has no recorded audio (Duas, Wudu/Salah step recitations).
// It reads the same verified text already on screen aloud rather than
// generating any new content, and works fully offline wherever the
// platform ships an on-device voice (most desktop OSes and Android do;
// coverage/quality of Arabic voices specifically varies by device, so this
// degrades to "button hidden" rather than pretending it always works).
export function useSpeech() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = (text: string, lang: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.85
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const cancel = () => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return { supported, speaking, speak, cancel }
}
