import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkX } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { PlaceholderPage } from '../../shared/ui/PlaceholderPage'
import { bookmarksRepo } from '../../shared/db/repositories'
import { getQuranMeta } from '../quran/api/quranContent'
import type { Bookmark } from '../../shared/db/types'
import type { QuranMeta } from '../quran/types'
import './BookmarksPage.css'

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null)
  const [meta, setMeta] = useState<QuranMeta | null>(null)

  useEffect(() => {
    void bookmarksRepo.list().then((list) => setBookmarks(list.filter((b) => !b.deleted)))
    void getQuranMeta().then(setMeta)
  }, [])

  if (bookmarks && bookmarks.length === 0) {
    return <PlaceholderPage title="Bookmarks" milestone="Bookmark an ayah in the Quran reader or a dua to see it here." />
  }

  return (
    <section className="bookmarks-page">
      <h1>Bookmarks</h1>
      <ul className="bookmarks-page__list">
        {bookmarks?.map((b) => {
          if (b.contentType === 'ayah' && b.surah && b.ayah) {
            const surah = meta?.surahs.find((s) => s.number === b.surah)
            return (
              <li key={b.localId}>
                <GlassCard
                  as={Link}
                  to={`/quran/${b.surah}`}
                  viewTransition
                  interactive
                  className="bookmarks-page__row"
                >
                  <span>{surah ? `${surah.nameTransliteration} ${b.surah}:${b.ayah}` : `${b.surah}:${b.ayah}`}</span>
                </GlassCard>
              </li>
            )
          }
          if (b.contentType === 'dua' && b.duaId) {
            return (
              <li key={b.localId}>
                <GlassCard as={Link} to="/duas" viewTransition interactive className="bookmarks-page__row">
                  <span>{b.note ?? 'Dua'}</span>
                </GlassCard>
              </li>
            )
          }
          if ((b.contentType === 'article' || b.contentType === 'story') && b.articleId) {
            const basePath = b.contentType === 'article' ? '/blogs' : '/stories'
            return (
              <li key={b.localId}>
                <GlassCard as={Link} to={`${basePath}/${b.articleId}`} viewTransition interactive className="bookmarks-page__row">
                  <span>{b.note ?? (b.contentType === 'article' ? 'Blog article' : 'Story')}</span>
                </GlassCard>
              </li>
            )
          }
          return (
            <li key={b.localId}>
              <GlassCard className="bookmarks-page__row bookmarks-page__row--unknown">
                <BookmarkX size={16} aria-hidden="true" />
                <span>{b.note ?? b.contentType}</span>
              </GlassCard>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
