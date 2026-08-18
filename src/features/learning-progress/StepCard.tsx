import { GlassCard } from '../../shared/ui/GlassCard'
import { ListenButton } from '../../shared/ui/ListenButton'
import { StageSelector } from './StageSelector'
import { useLearningStage } from './hooks/useLearningStage'
import type { LearningCategory } from '../../shared/db/types'
import './StepCard.css'

interface StepCardProps {
  category: LearningCategory
  itemId: string
  order: number
  title: string
  description: string
  arabic?: string | null
  transliteration?: string | null
  translation?: string | null
}

// Shared by Wudu and Salah step-through guides (and Duas' memorization
// cards use the same StageSelector/useLearningStage pair) so the
// not_started -> learning -> practicing -> memorized flow looks and behaves
// identically everywhere it appears.
export function StepCard({
  category,
  itemId,
  order,
  title,
  description,
  arabic,
  transliteration,
  translation,
}: StepCardProps) {
  const { stage, setStage } = useLearningStage(category, itemId)

  return (
    <GlassCard className="step-card">
      <div className="step-card__header">
        <span className="step-card__order">{order}</span>
        <h2>{title}</h2>
        {arabic && (
          <div className="step-card__listen">
            <ListenButton text={arabic} lang="ar-SA" />
          </div>
        )}
      </div>
      <p className="step-card__description">{description}</p>
      {arabic && (
        <p className="step-card__arabic arabic-text" lang="ar">
          {arabic}
        </p>
      )}
      {transliteration && <p className="step-card__transliteration">{transliteration}</p>}
      {translation && <p className="step-card__translation">{translation}</p>}
      <StageSelector stage={stage} onChange={(s) => void setStage(s)} />
    </GlassCard>
  )
}
