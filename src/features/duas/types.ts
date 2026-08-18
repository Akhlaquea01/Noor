export interface DuaCategory {
  id: string
  label: string
  count: number
}

export interface Dua {
  id: string
  title: string
  reference: string
  surah: number
  ayahStart: number
  ayahEnd: number
  arabic: string
  translation: string
  transliteration: string
}
