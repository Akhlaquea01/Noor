import './Skeleton.css'

interface SkeletonProps {
  width?: string
  height?: string
  radius?: string
  className?: string
}

// Shimmer placeholder used wherever content loads from IndexedDB/network
// (Quran progress card, dua lists, download rows) so loading states feel
// intentional rather than a blank flash.
export function Skeleton({ width = '100%', height = '1rem', radius = 'var(--radius-sm)', className }: SkeletonProps) {
  return (
    <span
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
