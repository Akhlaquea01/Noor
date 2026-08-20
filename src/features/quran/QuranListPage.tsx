import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { SearchInput } from '../../shared/ui/SearchInput'
import { FavoriteButton } from '../bookmarks-favorites/FavoriteButton'
import { getQuranMeta } from './api/quranContent'
import { useQuranProgressStore } from '../../shared/state/quranProgressStore'
import type { QuranMeta } from './types'
import './QuranListPage.css'

export function QuranListPage() {
  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const [query, setQuery] = useState('')
  const lastSurah = useQuranProgressStore((s) => s.progress.lastSurah)

  useEffect(() => {
    void getQuranMeta().then(setMeta)
  }, [])

  const surahs = useMemo(() => {
    if (!meta) return []
    const q = query.trim().toLowerCase()
    if (!q) return meta.surahs
    return meta.surahs.filter(
      (s) =>
        s.nameTransliteration.toLowerCase().includes(q) ||
        s.nameTranslation.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        String(s.number).includes(q)
    )
  }, [meta, query])

  return (
    <section className="quran-list-page">
      <h1>Quran</h1>

      {meta && (
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search surahs by name or number"
          ariaLabel="Search surahs"
        />
      )}

      {!meta && (
        <div className="quran-list-page__skeletons">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="4.25rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {meta && surahs.length === 0 && <p className="quran-list-page__empty">No surahs match "{query}".</p>}

      {meta && surahs.length > 0 && (
        <ul className="quran-list-page__list">
          {surahs.map((s) => (
            <li key={s.number}>
              <GlassCard className="quran-list-page__row">
                <Link to={`/quran/${s.number}`} viewTransition className="quran-list-page__row-link">
                  <span className="quran-list-page__number">{s.number}</span>
                  <div className="quran-list-page__names">
                    <strong>
                      {s.nameTransliteration}
                      {lastSurah === s.number && <BookOpen className="quran-list-page__continue-icon" size={14} aria-hidden="true" />}
                    </strong>
                    <span className="quran-list-page__meta">
                      {s.nameTranslation} &middot; {s.ayahCount} ayahs
                    </span>
                  </div>
                  <span className="quran-list-page__arabic-name arabic-text" lang="ar">
                    {s.nameArabic}
                  </span>
                </Link>
                <FavoriteButton contentType="surah" refId={String(s.number)} />
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
