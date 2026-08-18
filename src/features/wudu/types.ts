export interface WuduStep {
  id: string
  order: number
  title: string
  description: string
  arabic?: string | null
  transliteration?: string | null
  translation?: string | null
}
