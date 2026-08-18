import { Sparkles } from 'lucide-react'
import { GlassCard } from './GlassCard'
import './PlaceholderPage.css'

interface PlaceholderPageProps {
  title: string
  milestone: string
}

// Temporary stand-in for routes not yet built. Each feature milestone
// replaces its corresponding placeholder with the real screen.
export function PlaceholderPage({ title, milestone }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <GlassCard glow="teal" className="placeholder-page__card">
        <Sparkles className="placeholder-page__icon" aria-hidden="true" />
        <h1>{title}</h1>
        <p>{milestone}</p>
      </GlassCard>
    </section>
  )
}
