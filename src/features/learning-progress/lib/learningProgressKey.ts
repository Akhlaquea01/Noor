import type { LearningCategory } from '../../../shared/db/types'

export function learningProgressKey(category: LearningCategory, itemId: string): string {
  return `${category}:${itemId}`
}
