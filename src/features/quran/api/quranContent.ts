import type { QuranMeta, ArabicVerse, TranslationVerse, TransliterationVerse, CombinedVerse } from '../types'

// All of these hit /data/quran/**, which is precached by the service worker
// (see vite.config.ts globPatterns + src/sw/sw.ts) — these fetches work
// fully offline after first install, no network required.
let metaPromise: Promise<QuranMeta> | null = null

export function getQuranMeta(): Promise<QuranMeta> {
  if (!metaPromise) {
    metaPromise = fetch('/data/quran/meta.json').then((r) => r.json())
  }
  return metaPromise
}

function pad3(n: number): string {
  return String(n).padStart(3, '0')
}

export async function getSurahVerses(surahNumber: number): Promise<CombinedVerse[]> {
  const file = pad3(surahNumber)
  const [arabic, translation, transliteration] = await Promise.all([
    fetch(`/data/quran/arabic/${file}.json`).then((r) => r.json() as Promise<ArabicVerse[]>),
    fetch(`/data/quran/translation-en/${file}.json`).then((r) => r.json() as Promise<TranslationVerse[]>),
    fetch(`/data/quran/transliteration/${file}.json`).then((r) => r.json() as Promise<TransliterationVerse[]>),
  ])

  return arabic.map((v, i) => ({
    ayah: v.ayah,
    text: v.text,
    translation: translation[i].translation,
    transliteration: transliteration[i].transliteration,
  }))
}
