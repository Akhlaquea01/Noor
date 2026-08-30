import { GlassCard } from '../../shared/ui/GlassCard'
import { ListenButton } from '../../shared/ui/ListenButton'
import { StageSelector } from './StageSelector'
import { useLearningStage } from './hooks/useLearningStage'
import type { LearningCategory } from '../../shared/db/types'
import type { FiqhType } from '../wudu/types'
import './StepCard.css'

const FIQH_TYPE_LABEL: Record<FiqhType, string> = {
  shart: 'Condition',
  fard: 'Fard',
  wajib: 'Wajib',
  sunnah: 'Sunnah',
}

interface StepCardProps {
  category: LearningCategory
  itemId: string
  order: number
  title: string
  description: string
  fiqhType?: FiqhType | null
  note?: string | null
  arabic?: string | null
  transliteration?: string | null
  translation?: string | null
  /** Label shown above the translation/meaning text — e.g. "Meaning (Urdu)" for Wudu, defaults to "Translation". */
  translationLabel?: string
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
  fiqhType,
  note,
  arabic,
  transliteration,
  translation,
  translationLabel = 'Translation',
}: StepCardProps) {
  const { stage, setStage } = useLearningStage(category, itemId)

  return (
    <GlassCard className="step-card">
      <div className="step-card__header">
        <span className="step-card__order">{order}</span>
        <h2>{title}</h2>
        {fiqhType && (
          <span className={`step-card__fiqh-badge step-card__fiqh-badge--${fiqhType}`}>{FIQH_TYPE_LABEL[fiqhType]}</span>
        )}
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
      {translation && (
        <div className="step-card__translation-block">
          <small className="step-card__translation-label">{translationLabel}</small>
          <p className="step-card__translation">{translation}</p>
        </div>
      )}
      {note && <p className="step-card__note">{note}</p>}
      <StageSelector stage={stage} onChange={(s) => void setStage(s)} />
    </GlassCard>
  )
}
