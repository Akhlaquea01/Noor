import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { StageSelector } from '../learning-progress/StageSelector'
import { useLearningStage } from '../learning-progress/hooks/useLearningStage'
import { BookmarkButton } from '../bookmarks-favorites/BookmarkButton'
import { ListenButton } from '../../shared/ui/ListenButton'
import { ShareButton } from '../../shared/ui/ShareButton'
import { getDuasByCategory, getDuaCategories } from './api/duaContent'
import type { Dua, DuaCategory } from './types'
import './DuaListPage.css'

export function DuaCard({ dua }: { dua: Dua }) {
  const { stage, setStage } = useLearningStage('dua', dua.id)

  return (
    <GlassCard className="dua-list-page__card">
      <div className="dua-list-page__card-header">
        <h2>{dua.title}</h2>
        <div className="dua-list-page__card-actions">
          <ListenButton text={dua.arabic} lang="ar-SA" />
          <BookmarkButton contentType="dua" refId={dua.id} extra={{ duaId: dua.id, note: dua.title }} />
          <ShareButton
            title={dua.title}
            text={`${dua.title}\n\n${dua.arabic}\n\n"${dua.translation}"\n— ${dua.reference}`}
            iconOnly
          />
        </div>
      </div>
      <p className="dua-list-page__reference">{dua.reference}</p>
      <p className="dua-list-page__arabic arabic-text" lang="ar">
        {dua.arabic}
      </p>
      <p className="dua-list-page__transliteration">{dua.transliteration}</p>
      <small className="dua-list-page__translation-label">
        {dua.translationLang === 'ur' ? 'Meaning (Urdu)' : 'Translation'}
      </small>
      <p className="dua-list-page__translation">{dua.translation}</p>
      {dua.note && <p className="dua-list-page__note">{dua.note}</p>}
      <StageSelector stage={stage} onChange={(s) => void setStage(s)} />
    </GlassCard>
  )
}

export function DuaListPage() {
  const { categoryId } = useParams()
  const [duas, setDuas] = useState<Dua[] | null>(null)
  const [category, setCategory] = useState<DuaCategory | null>(null)

  useEffect(() => {
    if (!categoryId) return
    setDuas(null)
    void getDuasByCategory(categoryId).then(setDuas)
    void getDuaCategories().then((cats) => setCategory(cats.find((c) => c.id === categoryId) ?? null))
  }, [categoryId])

  return (
    <section className="dua-list-page">
      <Link to="/duas" className="dua-list-page__back">
        <ChevronLeft size={18} aria-hidden="true" /> Duas
      </Link>
      <h1>{category?.label ?? 'Duas'}</h1>

      {!duas && (
        <div className="dua-list-page__skeletons">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="8rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {duas && (
        <div className="dua-list-page__list">
          {duas.map((d) => (
            <DuaCard key={d.id} dua={d} />
          ))}
        </div>
      )}
    </section>
  )
}
