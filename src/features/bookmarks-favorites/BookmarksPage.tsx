import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkX, Star } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { PlaceholderPage } from '../../shared/ui/PlaceholderPage'
import { Skeleton } from '../../shared/ui/Skeleton'
import { bookmarksRepo, favoritesRepo } from '../../shared/db/repositories'
import { getQuranMeta } from '../quran/api/quranContent'
import { getArticleById } from '../articles/api/articleContent'
import type { Bookmark, Favorite } from '../../shared/db/types'
import type { QuranMeta } from '../quran/types'
import './BookmarksPage.css'

interface ResolvedFavorite {
  key: string
  label: string
  sub?: string
  to: string
}

async function resolveFavorite(f: Favorite, meta: QuranMeta | null): Promise<ResolvedFavorite> {
  if (f.contentType === 'surah') {
    const num = Number(f.refId)
    const surah = meta?.surahs.find((s) => s.number === num)
    return {
      key: f.localId,
      label: surah ? surah.nameTransliteration : `Surah ${f.refId}`,
      sub: surah?.nameTranslation,
      to: `/quran/${f.refId}`,
    }
  }
  if (f.contentType === 'article' || f.contentType === 'story') {
    const kind = f.contentType === 'article' ? 'blog' : 'story'
    const basePath = f.contentType === 'article' ? '/blogs' : '/stories'
    const article = await getArticleById(kind, f.refId)
    return { key: f.localId, label: article?.title ?? f.refId, to: `${basePath}/${f.refId}` }
  }
  // 'dua' and 'ayah' aren't wired to a favorite toggle yet (Bookmark already
  // covers "save for later" for those), but the store supports them so a
  // future favorite entry of that kind still renders instead of vanishing.
  return { key: f.localId, label: f.refId, to: '/' }
}

type Tab = 'bookmarks' | 'favorites'

export function BookmarksPage() {
  const [tab, setTab] = useState<Tab>('bookmarks')
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null)
  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const [rawFavorites, setRawFavorites] = useState<Favorite[] | null>(null)
  const [favorites, setFavorites] = useState<ResolvedFavorite[] | null>(null)

  useEffect(() => {
    void bookmarksRepo.list().then((list) => setBookmarks(list.filter((b) => !b.deleted)))
    void getQuranMeta().then(setMeta)
  }, [])

  // Fetched once per tab visit, but resolution (below) re-runs whenever
  // `meta` changes — otherwise a surah favorite resolved before meta.json
  // finished loading would be stuck showing "Surah 18" instead of "Al-Kahf"
  // forever, since the raw favorite list itself never changes.
  useEffect(() => {
    if (tab !== 'favorites' || rawFavorites) return
    void favoritesRepo.list().then((list) => setRawFavorites(list.filter((f) => !f.deleted)))
  }, [tab, rawFavorites])

  useEffect(() => {
    if (!rawFavorites) return
    void Promise.all(rawFavorites.map((f) => resolveFavorite(f, meta))).then(setFavorites)
  }, [rawFavorites, meta])

  return (
    <section className="bookmarks-page">
      <h1>Bookmarks &amp; Favorites</h1>

      <div className="bookmarks-page__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'bookmarks'}
          className={`bookmarks-page__tab${tab === 'bookmarks' ? ' bookmarks-page__tab--active' : ''}`}
          onClick={() => setTab('bookmarks')}
        >
          Bookmarks
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'favorites'}
          className={`bookmarks-page__tab${tab === 'favorites' ? ' bookmarks-page__tab--active' : ''}`}
          onClick={() => setTab('favorites')}
        >
          Favorites
        </button>
      </div>

      {tab === 'bookmarks' &&
        (bookmarks && bookmarks.length === 0 ? (
          <PlaceholderPage title="Bookmarks" milestone="Bookmark an ayah in the Quran reader or a dua to see it here." />
        ) : (
          <ul className="bookmarks-page__list">
            {bookmarks?.map((b) => {
              if (b.contentType === 'ayah' && b.surah && b.ayah) {
                const surah = meta?.surahs.find((s) => s.number === b.surah)
                return (
                  <li key={b.localId}>
                    <GlassCard as={Link} to={`/quran/${b.surah}`} viewTransition interactive className="bookmarks-page__row">
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
        ))}

      {tab === 'favorites' && !favorites && (
        <div className="bookmarks-page__skeletons">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="4rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {tab === 'favorites' && favorites && favorites.length === 0 && (
        <PlaceholderPage
          title="Favorites"
          milestone="Tap the star on a surah, blog article, or story to save it here for quick access."
        />
      )}

      {tab === 'favorites' && favorites && favorites.length > 0 && (
        <ul className="bookmarks-page__list">
          {favorites.map((f) => (
            <li key={f.key}>
              <GlassCard as={Link} to={f.to} viewTransition interactive className="bookmarks-page__row">
                <Star size={16} aria-hidden="true" className="bookmarks-page__favorite-icon" fill="currentColor" />
                <span>
                  {f.label}
                  {f.sub && <span className="bookmarks-page__row-sub"> &middot; {f.sub}</span>}
                </span>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
