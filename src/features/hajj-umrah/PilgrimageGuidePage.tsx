import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '../../shared/ui/Skeleton'
import { ChecklistStepCard } from './ChecklistStepCard'
import { usePilgrimageSection } from './hooks/usePilgrimageSection'
import type { PilgrimageGuide, PilgrimagePhase } from './types'
import type { PilgrimageSection } from '../../shared/db/types'
import './PilgrimageGuidePage.css'

const VALID_SECTIONS: PilgrimageSection[] = ['prepare', 'umrah', 'hajj']

function isPilgrimageSection(value: string | undefined): value is PilgrimageSection {
  return !!value && (VALID_SECTIONS as string[]).includes(value)
}

function phaseProgress(phase: PilgrimagePhase, doneSteps: Set<string>) {
  const total = phase.steps.length
  const done = phase.steps.filter((s) => doneSteps.has(s.id)).length
  return { done, total }
}

export function PilgrimageGuidePage() {
  const { guideId } = useParams()
  const section = isPilgrimageSection(guideId) ? guideId : null
  const [guide, setGuide] = useState<PilgrimageGuide | null>(null)
  const { doneSteps, toggle } = usePilgrimageSection(section ?? 'umrah')

  useEffect(() => {
    if (!section) return
    setGuide(null)
    void fetch(`/data/hajj-umrah/${section}.json`)
      .then((r) => r.json())
      .then(setGuide)
  }, [section])

  if (!section) return null

  const totalSteps = guide?.phases.reduce((sum, p) => sum + p.steps.length, 0) ?? 0
  const totalDone = guide?.phases.reduce((sum, p) => sum + p.steps.filter((s) => doneSteps.has(s.id)).length, 0) ?? 0

  return (
    <section className="pilgrimage-guide-page">
      <Link to="/hajj-umrah" className="pilgrimage-guide-page__back">
        <ChevronLeft size={18} aria-hidden="true" /> Hajj &amp; Umrah
      </Link>

      {!guide && (
        <div className="pilgrimage-guide-page__skeletons">
          <Skeleton height="2.5rem" radius="var(--radius-md)" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {guide && (
        <>
          <h1>{guide.label}</h1>
          <p className="pilgrimage-guide-page__note">{guide.description}</p>

          <div className="pilgrimage-guide-page__progress">
            <div className="pilgrimage-guide-page__progress-bar">
              <div
                className="pilgrimage-guide-page__progress-fill"
                style={{ width: totalSteps ? `${(totalDone / totalSteps) * 100}%` : '0%' }}
              />
            </div>
            <span>
              {totalDone} of {totalSteps} steps done
            </span>
          </div>

          {guide.phases.map((phase) => {
            const { done, total } = phaseProgress(phase, doneSteps)
            return (
              <section key={phase.id} className="pilgrimage-guide-page__phase">
                <div className="pilgrimage-guide-page__phase-header">
                  <div>
                    <h2>{phase.title}</h2>
                    {phase.subtitle && <p className="pilgrimage-guide-page__phase-subtitle">{phase.subtitle}</p>}
                  </div>
                  <span className="pilgrimage-guide-page__phase-badge">
                    {done}/{total}
                  </span>
                </div>
                <div className="pilgrimage-guide-page__steps">
                  {phase.steps.map((step) => (
                    <ChecklistStepCard
                      key={step.id}
                      step={step}
                      done={doneSteps.has(step.id)}
                      onToggle={() => void toggle(step.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          <p className="pilgrimage-guide-page__disclaimer">{guide.disclaimer}</p>
        </>
      )}
    </section>
  )
}
