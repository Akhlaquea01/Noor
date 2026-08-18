import { Sparkles } from 'lucide-react'
import { useServiceWorkerUpdate } from '../shared/hooks/useServiceWorkerUpdate'
import './UpdateBanner.css'

export function UpdateBanner() {
  const { needRefresh, applyUpdate } = useServiceWorkerUpdate()

  if (!needRefresh) return null

  return (
    <div role="status" className="update-banner">
      <Sparkles className="update-banner__icon" aria-hidden="true" size={16} />
      <span>A new version of Noor is available.</span>
      <button type="button" onClick={() => applyUpdate()}>
        Update now
      </button>
    </div>
  )
}
