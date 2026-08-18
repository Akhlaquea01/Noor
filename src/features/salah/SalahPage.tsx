import { useEffect, useState } from 'react'
import { StepCard } from '../learning-progress/StepCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import type { SalahVariant } from './types'
import './SalahPage.css'

export function SalahPage() {
  const [variant, setVariant] = useState<SalahVariant | null>(null)

  useEffect(() => {
    void fetch('/data/salah/essentials.json')
      .then((r) => r.json())
      .then(setVariant)
  }, [])

  return (
    <section className="salah-page">
      <h1>Salah</h1>
      <p className="salah-page__note">{variant?.description ?? 'The core sequence of prayer.'}</p>

      {!variant && (
        <div className="salah-page__skeletons">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {variant && (
        <div className="salah-page__steps">
          {variant.steps.map((step) => (
            <StepCard
              key={step.id}
              category="salah"
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
