import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { getQuranMeta } from './api/quranContent'
import { useQuranProgressStore } from '../../shared/state/quranProgressStore'
import type { QuranMeta } from './types'
import './QuranListPage.css'

export function QuranListPage() {
  const [meta, setMeta] = useState<QuranMeta | null>(null)
  const lastSurah = useQuranProgressStore((s) => s.progress.lastSurah)

  useEffect(() => {
    void getQuranMeta().then(setMeta)
  }, [])

  return (
    <section className="quran-list-page">
      <h1>Quran</h1>

      {!meta && (
        <div className="quran-list-page__skeletons">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="4.25rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {meta && (
        <ul className="quran-list-page__list">
          {meta.surahs.map((s) => (
            <li key={s.number}>
              <GlassCard
                as={Link}
                to={`/quran/${s.number}`}
                viewTransition
                interactive
                className="quran-list-page__row"
              >
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
              </GlassCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
