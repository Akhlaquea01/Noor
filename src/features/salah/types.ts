import type { WuduStep } from '../wudu/types'

export type SalahStep = WuduStep

export interface SalahVariant {
  id: string
  label: string
  description: string
  steps: SalahStep[]
}
