import type { LearningStage } from '../../shared/db/types'
import './StageSelector.css'

const STAGES: { value: LearningStage; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'learning', label: 'Learning' },
  { value: 'practicing', label: 'Practicing' },
  { value: 'memorized', label: 'Memorized' },
]

interface StageSelectorProps {
  stage: LearningStage
  onChange: (stage: LearningStage) => void
}

export function StageSelector({ stage, onChange }: StageSelectorProps) {
  return (
    <div className="stage-selector" role="radiogroup" aria-label="Memorization progress">
      {STAGES.map((s) => (
        <button
          key={s.value}
          type="button"
          role="radio"
          aria-checked={stage === s.value}
          className={`stage-selector__option${stage === s.value ? ' stage-selector__option--active' : ''}`}
          onClick={() => onChange(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
