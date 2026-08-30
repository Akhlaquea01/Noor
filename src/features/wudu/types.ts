export type FiqhType = 'shart' | 'fard' | 'wajib' | 'sunnah'

export type TranslationLang = 'en' | 'ur'

export interface WuduStep {
  id: string
  order: number
  title: string
  description: string
  fiqhType?: FiqhType | null
  note?: string | null
  arabic?: string | null
  transliteration?: string | null
  translation?: string | null
  translationLang?: TranslationLang | null
}
