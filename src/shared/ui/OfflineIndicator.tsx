import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import './OfflineIndicator.css'

const CONFIG = {
  online: { label: 'Online', Icon: Wifi },
  offline: { label: 'Offline', Icon: WifiOff },
  syncing: { label: 'Syncing', Icon: RefreshCw },
  synced: { label: 'All changes saved', Icon: Check },
} as const

export function OfflineIndicator() {
  const status = useOnlineStatus()
  const { label, Icon } = CONFIG[status]

  return (
    <span className={`offline-indicator offline-indicator--${status}`} role="status">
      <Icon className="offline-indicator__icon" aria-hidden="true" size={14} />
      {label}
    </span>
  )
}
