import type { WuduStep } from '../wudu/types'

export type SalahStep = WuduStep

export interface SalahPrecondition {
  id: string
  title: string
  detail: string
  linkTo?: string | null
}

export interface SalahVariant {
  id: string
  label: string
  description: string
  preconditions: SalahPrecondition[]
  steps: SalahStep[]
}
