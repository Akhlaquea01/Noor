import { useEffect, useState } from 'react'
import { StepCard } from '../learning-progress/StepCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import type { WuduStep } from './types'
import './WuduPage.css'

export function WuduPage() {
  const [steps, setSteps] = useState<WuduStep[] | null>(null)

  useEffect(() => {
    void fetch('/data/wudu/steps.json')
      .then((r) => r.json())
      .then(setSteps)
  }, [])

  return (
    <section className="wudu-page">
      <h1>Wudu</h1>
      <p className="wudu-page__note">The ritual purification performed before prayer.</p>

      {!steps && (
        <div className="wudu-page__skeletons">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {steps && (
        <div className="wudu-page__steps">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              category="wudu"
              itemId={step.id}
              order={step.order}
              title={step.title}
              description={step.description}
              arabic={step.arabic}
              transliteration={step.transliteration}
              translation={step.translation}
            />
          ))}
        </div>
      )}
    </section>
  )
}
