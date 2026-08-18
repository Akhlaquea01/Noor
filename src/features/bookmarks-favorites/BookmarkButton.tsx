import { Bookmark as BookmarkIcon } from 'lucide-react'
import { useBookmark } from './hooks/useBookmark'
import type { Bookmark, ContentType } from '../../shared/db/types'
import './BookmarkButton.css'

interface BookmarkButtonProps {
  contentType: ContentType
  refId: string
  extra?: Partial<Bookmark>
  label?: string
}

export function BookmarkButton({ contentType, refId, extra, label = 'Bookmark' }: BookmarkButtonProps) {
  const { bookmarked, toggle } = useBookmark(contentType, refId, extra)

  return (
    <button
      type="button"
      className={`bookmark-button${bookmarked ? ' bookmark-button--active' : ''}`}
      aria-pressed={bookmarked}
      onClick={() => void toggle()}
    >
      <BookmarkIcon size={16} aria-hidden="true" fill={bookmarked ? 'currentColor' : 'none'} />
      {bookmarked ? 'Bookmarked' : label}
    </button>
  )
}
