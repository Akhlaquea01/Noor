import type { Favorite } from '../../../shared/db/types'

// Deterministic (not random uuid) so "is this favorited" is a direct key
// lookup rather than a scan over all favorites by contentType+refId.
export function favoriteKey(contentType: Favorite['contentType'], refId: string): string {
  return `${contentType}:${refId}`
}
