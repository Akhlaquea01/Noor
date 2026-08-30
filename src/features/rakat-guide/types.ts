export type RakatSegmentType = 'sunnah-muakkadah' | 'sunnah-ghair-muakkadah' | 'fard' | 'wajib' | 'nafl'

export interface RakatSegment {
  type: RakatSegmentType
  label: string
  rakat: number
}

export interface DailyPrayerRakat {
  id: string
  name: string
  arabicName: string
  timing: string
  sequence: RakatSegment[]
  totalRakat: number
  note: string | null
}

export interface JumuahStep {
  order: number
  label: string
  type: RakatSegmentType
  rakat: number
  method: string
}

export interface JumuahGuide {
  description: string
  steps: JumuahStep[]
  totalRakat: number
  note: string
}

export interface NafilPrayer {
  id: string
  name: string
  timing: string
  rakat: string
  virtue: string
}

export interface SpecialOccasion {
  id: string
  name: string
  detail: string
}

export interface RakatDefinition {
  term: string
  meaning: string
}

export interface AdhkarItem {
  label: string
  count: string | null
}

export interface RakatGuide {
  dailyPrayers: DailyPrayerRakat[]
  totalDailyRakat: number
  jumuah: JumuahGuide
  nawafil: NafilPrayer[]
  specialOccasions: SpecialOccasion[]
  definitions: RakatDefinition[]
  adhkar: AdhkarItem[]
  disclaimer: string
}
