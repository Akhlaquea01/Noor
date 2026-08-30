import { Check } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { ListenButton } from '../../shared/ui/ListenButton'
import type { PilgrimageStep } from './types'
import './ChecklistStepCard.css'

interface ChecklistStepCardProps {
  step: PilgrimageStep
  done: boolean
  onToggle: () => void
}

// Unlike StepCard's four-stage memorization flow (learn it before you go),
// this is a plain done/not-done toggle — for following along step by step
// during the actual journey, where "have I done this yet today" is the
// only question that matters.
export function ChecklistStepCard({ step, done, onToggle }: ChecklistStepCardProps) {
  return (
    <GlassCard className={`checklist-step-card${done ? ' checklist-step-card--done' : ''}`}>
      <div className="checklist-step-card__header">
        <button
          type="button"
          className="checklist-step-card__check"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Mark "${step.title}" as not done` : `Mark "${step.title}" as done`}
          onClick={onToggle}
        >
          {done ? <Check size={14} aria-hidden="true" /> : <span className="checklist-step-card__order">{step.order}</span>}
        </button>
        <h3>{step.title}</h3>
        {step.arabic && (
          <div className="checklist-step-card__listen">
            <ListenButton text={step.arabic} lang="ar-SA" />
          </div>
        )}
      </div>
      <p className="checklist-step-card__description">{step.description}</p>
      {step.arabic && (
        <p className="checklist-step-card__arabic arabic-text" lang="ar">
          {step.arabic}
        </p>
      )}
      {step.transliteration && <p className="checklist-step-card__transliteration">{step.transliteration}</p>}
      {step.translation && (
        <div className="checklist-step-card__translation-block">
          <small className="checklist-step-card__translation-label">
            {step.translationLang === 'ur' ? 'Meaning (Urdu)' : 'Translation'}
          </small>
          <p className="checklist-step-card__translation">{step.translation}</p>
        </div>
      )}
      {step.note && <p className="checklist-step-card__note">{step.note}</p>}
    </GlassCard>
  )
}
