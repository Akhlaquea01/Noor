export interface DuaCategory {
  id: string
  label: string
  count: number
}

export interface Dua {
  id: string
  title: string
  reference: string
  // Quran-sourced duas carry these (resolved from the verified Quran text);
  // hadith-sourced daily-life duas (eating, sleeping, etc.) omit them —
  // there's no ayah range to point at, only the hand-verified Arabic below.
  surah?: number
  ayahStart?: number
  ayahEnd?: number
  arabic: string
  translation: string
  transliteration: string
  // 'ur' for hand-authored hadith duas (see build-content.mjs) — keeps them
  // labeled "Meaning (Urdu)" rather than implying they're the verified
  // Saheeh International English translation used for Quran-sourced duas.
  translationLang?: 'en' | 'ur'
  note?: string | null
}
