import { useEffect, useState } from 'react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import type { RakatGuide, RakatSegment } from './types'
import './RakatGuidePage.css'

const SEGMENT_SHORT_LABEL: Record<RakatSegment['type'], string> = {
  'sunnah-muakkadah': 'Sunnah',
  'sunnah-ghair-muakkadah': 'Sunnah',
  fard: 'Fard',
  wajib: 'Witr',
  nafl: 'Nafl',
}

function SegmentRow({ sequence }: { sequence: RakatSegment[] }) {
  return (
    <div className="rakat-guide-page__sequence">
      {sequence.map((segment, i) => (
        <span key={i} className={`rakat-guide-page__segment rakat-guide-page__segment--${segment.type}`}>
          <strong>{segment.rakat}</strong>
          <small>{SEGMENT_SHORT_LABEL[segment.type]}</small>
        </span>
      ))}
    </div>
  )
}

export function RakatGuidePage() {
  const [guide, setGuide] = useState<RakatGuide | null>(null)

  useEffect(() => {
    void fetch('/data/rakat-guide/guide.json')
      .then((r) => r.json())
      .then(setGuide)
  }, [])

  if (!guide) {
    return (
      <section className="rakat-guide-page">
        <h1>Rak&apos;ahs Guide</h1>
        <div className="rakat-guide-page__skeletons">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="7rem" radius="var(--radius-lg)" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="rakat-guide-page">
      <header className="rakat-guide-page__header">
        <h1>Rak&apos;ahs Guide</h1>
        <p className="rakat-guide-page__note">
          The Sunnah, Fard, and Nafl sequence of each daily prayer &mdash; {guide.totalDailyRakat} rak&apos;ahs in total, every day.
        </p>
      </header>

      <div className="rakat-guide-page__prayers">
        {guide.dailyPrayers.map((prayer) => (
          <GlassCard key={prayer.id} className="rakat-guide-page__prayer-card">
            <div className="rakat-guide-page__prayer-head">
              <div>
                <h2>{prayer.name}</h2>
                <p className="rakat-guide-page__timing">{prayer.timing}</p>
              </div>
              <span className="rakat-guide-page__total">
                <strong>{prayer.totalRakat}</strong>
                <small>rak&apos;ahs</small>
              </span>
            </div>
            <SegmentRow sequence={prayer.sequence} />
            {prayer.note && <p className="rakat-guide-page__prayer-note">{prayer.note}</p>}
          </GlassCard>
        ))}
      </div>

      <section className="rakat-guide-page__section">
        <h2>Jumu&apos;ah (Friday)</h2>
        <p className="rakat-guide-page__section-intro">{guide.jumuah.description}</p>
        <GlassCard className="rakat-guide-page__jumuah-card">
          <ol className="rakat-guide-page__jumuah-steps">
            {guide.jumuah.steps.map((step) => (
              <li key={step.order}>
                <span className={`rakat-guide-page__segment rakat-guide-page__segment--${step.type}`}>
                  <strong>{step.rakat}</strong>
                  <small>{SEGMENT_SHORT_LABEL[step.type]}</small>
                </span>
                <span className="rakat-guide-page__jumuah-method">{step.method}</span>
              </li>
            ))}
          </ol>
          <p className="rakat-guide-page__prayer-note">{guide.jumuah.note}</p>
        </GlassCard>
      </section>

      <section className="rakat-guide-page__section">
        <h2>Extra &amp; Voluntary Prayers (Nawafil)</h2>
        <div className="rakat-guide-page__nawafil-list">
          {guide.nawafil.map((n) => (
            <GlassCard key={n.id} className="rakat-guide-page__nawafil-card">
              <div className="rakat-guide-page__nawafil-head">
                <strong>{n.name}</strong>
                <span>{n.rakat}</span>
              </div>
              <p className="rakat-guide-page__timing">{n.timing}</p>
              <p className="rakat-guide-page__prayer-note">{n.virtue}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="rakat-guide-page__section">
        <h2>Special Occasions</h2>
        <div className="rakat-guide-page__occasions">
          {guide.specialOccasions.map((o) => (
            <GlassCard key={o.id} className="rakat-guide-page__occasion-card">
              <strong>{o.name}</strong>
              <p>{o.detail}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="rakat-guide-page__section">
        <h2>Definitions</h2>
        <GlassCard className="rakat-guide-page__definitions">
          {guide.definitions.map((d) => (
            <div key={d.term} className="rakat-guide-page__definition-row">
              <strong>{d.term}</strong>
              <p>{d.meaning}</p>
            </div>
          ))}
        </GlassCard>
      </section>

      <section className="rakat-guide-page__section">
        <h2>Post-Prayer Adhkar</h2>
        <GlassCard className="rakat-guide-page__adhkar">
          {guide.adhkar.map((a, i) => (
            <div key={i} className="rakat-guide-page__adhkar-row">
              <span>{a.label}</span>
              {a.count && <strong>{a.count}</strong>}
            </div>
          ))}
        </GlassCard>
      </section>

      <p className="rakat-guide-page__disclaimer">{guide.disclaimer}</p>
    </section>
  )
}
