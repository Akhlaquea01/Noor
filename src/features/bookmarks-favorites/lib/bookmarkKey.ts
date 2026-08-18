import type { ContentType } from '../../../shared/db/types'

// Deterministic (not random uuid) so "is this bookmarked" is a direct key
// lookup rather than a scan over all bookmarks by contentType+refId.
export function bookmarkKey(contentType: ContentType, refId: string): string {
  return `${contentType}:${refId}`
}
