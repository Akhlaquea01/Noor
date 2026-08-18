import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { tasbihSessionsRepo } from '../../shared/db/repositories'
import './TasbihPage.css'

const DHIKR_OPTIONS = [
  { label: 'SubhanAllah', target: 33 },
  { label: 'Alhamdulillah', target: 33 },
  { label: 'Allahu Akbar', target: 34 },
  { label: 'Astaghfirullah', target: 100 },
  { label: 'Custom', target: 0 },
]

export function TasbihPage() {
  const [dhikrIndex, setDhikrIndex] = useState(0)
  const [count, setCount] = useState(0)
  const startedAtRef = useRef(Date.now())

  const dhikr = DHIKR_OPTIONS[dhikrIndex]
  const target = dhikr.target

  useEffect(() => {
    startedAtRef.current = Date.now()
    setCount(0)
  }, [dhikrIndex])

  const saveSession = (finalCount: number, completed: boolean) => {
    if (finalCount === 0) return
    void tasbihSessionsRepo.add({
      dhikrText: dhikr.label,
      targetCount: target,
      count: finalCount,
      startedAt: startedAtRef.current,
      endedAt: Date.now(),
      completed,
    })
  }

  const increment = () => {
    const next = count + 1
    setCount(next)
    if (target > 0 && next === target && navigator.vibrate) navigator.vibrate(80)
  }

  const reset = () => {
    saveSession(count, target > 0 && count >= target)
    setCount(0)
    startedAtRef.current = Date.now()
  }

  return (
    <section className="tasbih-page">
      <h1>Tasbih</h1>

      <div className="tasbih-page__dhikr-select" role="radiogroup" aria-label="Dhikr">
        {DHIKR_OPTIONS.map((option, i) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={dhikrIndex === i}
            className={`tasbih-page__dhikr-option${dhikrIndex === i ? ' tasbih-page__dhikr-option--active' : ''}`}
            onClick={() => {
              saveSession(count, target > 0 && count >= target)
              setDhikrIndex(i)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <GlassCard
        as="button"
        type="button"
        interactive
        glow={target > 0 && count >= target ? 'gold' : 'teal'}
        className="tasbih-page__counter"
        onClick={increment}
        aria-label={`${dhikr.label} count: ${count}${target > 0 ? ` of ${target}` : ''}. Tap to increment.`}
      >
        <span className="tasbih-page__count">{count}</span>
        {target > 0 && <span className="tasbih-page__target">of {target}</span>}
      </GlassCard>

      <button type="button" className="tasbih-page__reset" onClick={reset}>
        <RotateCcw size={16} aria-hidden="true" /> Reset
      </button>
    </section>
  )
}
