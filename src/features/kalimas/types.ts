import type { WuduStep } from '../wudu/types'

export type KalimaItem = WuduStep

export interface KalimaGuide {
  id: string
  label: string
  description: string
  disclaimer: string
  kalimas: KalimaItem[]
}
