import { useEffect, useState } from 'react'
import { favoritesRepo } from '../../../shared/db/repositories'
import { createSyncMeta } from '../../../shared/db/syncMeta'
import { favoriteKey } from '../lib/favoriteKey'
import type { Favorite } from '../../../shared/db/types'

export function useFavorite(contentType: Favorite['contentType'], refId: string) {
  const key = favoriteKey(contentType, refId)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    let cancelled = false
    void favoritesRepo.get(key).then((record) => {
      if (!cancelled) setFavorited(!!record && !record.deleted)
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const toggle = async () => {
    if (favorited) {
      await favoritesRepo.remove(key)
      setFavorited(false)
    } else {
      await favoritesRepo.put(key, {
        ...createSyncMeta(),
        contentType,
        refId,
        createdAt: Date.now(),
      })
      setFavorited(true)
    }
  }

  return { favorited, toggle }
}
