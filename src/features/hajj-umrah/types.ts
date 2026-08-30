export interface PilgrimageStep {
  id: string
  order: number
  title: string
  description: string
  note?: string | null
  arabic?: string | null
  transliteration?: string | null
  translation?: string | null
  translationLang?: 'en' | 'ur' | null
}

export interface PilgrimagePhase {
  id: string
  title: string
  subtitle?: string | null
  steps: PilgrimageStep[]
}

export interface PilgrimageGuide {
  id: string
  label: string
  description: string
  disclaimer: string
  phases: PilgrimagePhase[]
}
