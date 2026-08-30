import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check } from 'lucide-react'
import { StepCard } from '../learning-progress/StepCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { GlassCard } from '../../shared/ui/GlassCard'
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

      <GlassCard as={Link} to="/rakat-guide" viewTransition interactive className="salah-page__rakat-link">
        <span>
          <strong>How many rak&apos;ahs?</strong>
          <small>See the Sunnah, Fard, and Nafl sequence for each daily prayer</small>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </GlassCard>

      {!variant && (
        <div className="salah-page__skeletons">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {variant && (
        <>
          <GlassCard className="salah-page__preconditions">
            <h2>Before You Begin</h2>
            <ul className="salah-page__precondition-list">
              {variant.preconditions.map((p) => {
                const item = (
                  <>
                    <span className="salah-page__precondition-icon">
                      <Check size={13} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{p.title}</strong>
                      <small>{p.detail}</small>
                    </span>
                    {p.linkTo && <ChevronRight size={16} aria-hidden="true" className="salah-page__precondition-arrow" />}
                  </>
                )
                return (
                  <li key={p.id}>
                    {p.linkTo ? (
                      <Link to={p.linkTo} viewTransition className="salah-page__precondition-link">
                        {item}
                      </Link>
                    ) : (
                      <div className="salah-page__precondition-link">{item}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </GlassCard>

          <div className="salah-page__steps">
            {variant.steps.map((step) => (
              <StepCard
                key={step.id}
                category="salah"
                itemId={step.id}
                order={step.order}
                title={step.title}
                description={step.description}
                fiqhType={step.fiqhType}
                note={step.note}
                arabic={step.arabic}
                transliteration={step.transliteration}
                translation={step.translation}
                translationLabel={step.translationLang === 'ur' ? 'Meaning (Urdu)' : 'Translation'}
              />
            ))}
          </div>

          <GlassCard as={Link} to="/rakat-guide" viewTransition interactive className="salah-page__rakat-link">
            <span>
              <strong>Post-Prayer Adhkar</strong>
              <small>Astaghfirullah, Ayatul Kursi, and Tasbih-e-Fatima after Taslim</small>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </GlassCard>
        </>
      )}
    </section>
  )
}
