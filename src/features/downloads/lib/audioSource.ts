// mp3quran.net is a long-established, CORS-enabled public Quran audio host
// used by many open-source Quran apps. Reciter "afs" = Mishary Rashid
// Alafasy. Isolated here so the source can be swapped/extended (multiple
// reciters) without touching the download engine or UI.
const RECITER = 'afs'
const BASE_URL = `https://server8.mp3quran.net/${RECITER}`

function pad3(n: number): string {
  return String(n).padStart(3, '0')
}

export function getSurahAudioUrl(surahNumber: number): string {
  return `${BASE_URL}/${pad3(surahNumber)}.mp3`
}

export const RECITER_LABEL = 'Mishary Rashid Alafasy'
