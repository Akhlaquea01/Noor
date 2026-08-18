import { useEffect, useState } from 'react'
import { bookmarksRepo } from '../../../shared/db/repositories'
import { createSyncMeta } from '../../../shared/db/syncMeta'
import { bookmarkKey } from '../lib/bookmarkKey'
import type { Bookmark, ContentType } from '../../../shared/db/types'

export function useBookmark(contentType: ContentType, refId: string, extra: Partial<Bookmark> = {}) {
  const key = bookmarkKey(contentType, refId)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    let cancelled = false
    void bookmarksRepo.get(key).then((record) => {
      if (!cancelled) setBookmarked(!!record && !record.deleted)
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const toggle = async () => {
    if (bookmarked) {
      await bookmarksRepo.remove(key)
      setBookmarked(false)
    } else {
      await bookmarksRepo.put(key, {
        ...createSyncMeta(),
        contentType,
        createdAt: Date.now(),
        ...extra,
      })
      setBookmarked(true)
    }
  }

  return { bookmarked, toggle }
}
