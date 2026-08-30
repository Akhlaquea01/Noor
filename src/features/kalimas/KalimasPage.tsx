import { useEffect, useState } from 'react'
import { StepCard } from '../learning-progress/StepCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import type { KalimaGuide } from './types'
import './KalimasPage.css'

export function KalimasPage() {
  const [guide, setGuide] = useState<KalimaGuide | null>(null)

  useEffect(() => {
    void fetch('/data/kalimas/kalimas.json')
      .then((r) => r.json())
      .then(setGuide)
  }, [])

  return (
    <section className="kalimas-page">
      <h1>The 6 Kalimas</h1>
      <p className="kalimas-page__note">
        {guide?.description ?? 'Short statements of Islamic belief, commonly memorized in order.'}
      </p>

      {!guide && (
        <div className="kalimas-page__skeletons">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {guide && (
        <>
          <div className="kalimas-page__list">
            {guide.kalimas.map((kalima) => (
              <StepCard
                key={kalima.id}
                category="kalima"
                itemId={kalima.id}
                order={kalima.order}
                title={kalima.title}
                description={kalima.description}
                note={kalima.note}
                arabic={kalima.arabic}
                transliteration={kalima.transliteration}
                translation={kalima.translation}
                translationLabel="Meaning (Urdu)"
              />
            ))}
          </div>
          <p className="kalimas-page__disclaimer">{guide.disclaimer}</p>
        </>
      )}
    </section>
  )
}
