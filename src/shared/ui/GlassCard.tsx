import type { ElementType, ReactNode } from 'react'
import './GlassCard.css'

interface GlassCardProps {
  as?: ElementType
  glow?: 'none' | 'teal' | 'gold'
  /** Gradient hero panel (next-prayer, prayer countdown, etc.) instead of the default bordered-transparent card. */
  hero?: boolean
  /** Light-on-dark accent panel (verse-of-the-day style), for content meant to stand out from the surrounding dark UI. */
  accent?: boolean
  interactive?: boolean
  className?: string
  children: ReactNode
  [key: string]: unknown
}

// The base surface for nearly all Noor content: dashboard widgets, dua
// cards, learning-step cards, download rows. Reused across every feature
// milestone rather than re-implemented per screen. `as` lets it render as a
// <Link>, <button>, etc. — extra props (e.g. `to`, `onClick`) pass through.
export function GlassCard({
  as,
  glow = 'none',
  hero = false,
  accent = false,
  interactive = false,
  className,
  children,
  ...rest
}: GlassCardProps) {
  const Component = as ?? 'div'
  const classes = [
    'glass-card',
    `glass-card--glow-${glow}`,
    hero && 'glass-card--hero',
    accent && 'glass-card--accent',
    interactive && 'glass-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  )
}
