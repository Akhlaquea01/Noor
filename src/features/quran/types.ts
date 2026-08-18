export interface SurahMeta {
  number: number
  nameArabic: string
  nameTransliteration: string
  nameTranslation: string
  ayahCount: number
  revelationPlace: 'meccan' | 'medinan'
}

export interface JuzMeta {
  juz: number
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
  startAyahId: number
  endAyahId: number
}

export interface QuranMeta {
  surahs: SurahMeta[]
  juz: JuzMeta[]
  totalAyahs: number
}

export interface ArabicVerse {
  ayah: number
  text: string
}

export interface TranslationVerse {
  ayah: number
  translation: string
}

export interface TransliterationVerse {
  ayah: number
  transliteration: string
}

export interface CombinedVerse {
  ayah: number
  text: string
  translation: string
  transliteration: string
}
