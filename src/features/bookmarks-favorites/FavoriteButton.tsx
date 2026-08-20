import { Star } from 'lucide-react'
import { useFavorite } from './hooks/useFavorite'
import type { Favorite } from '../../shared/db/types'
import './FavoriteButton.css'

interface FavoriteButtonProps {
  contentType: Favorite['contentType']
  refId: string
}

// Compact icon-only star, distinct from BookmarkButton's labeled pill —
// this is meant to sit inline at the end of a list row (surah, article)
// as a quick "save for later" toggle, not inside a detail page's action bar.
export function FavoriteButton({ contentType, refId }: FavoriteButtonProps) {
  const { favorited, toggle } = useFavorite(contentType, refId)

  return (
    <button
      type="button"
      className={`favorite-button${favorited ? ' favorite-button--active' : ''}`}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault()
        void toggle()
      }}
    >
      <Star size={16} aria-hidden="true" fill={favorited ? 'currentColor' : 'none'} />
    </button>
  )
}
