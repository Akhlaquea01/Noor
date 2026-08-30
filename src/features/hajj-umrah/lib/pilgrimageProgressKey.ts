import type { PilgrimageSection } from '../../../shared/db/types'

export function pilgrimageProgressKey(section: PilgrimageSection, stepId: string): string {
  return `${section}:${stepId}`
}
