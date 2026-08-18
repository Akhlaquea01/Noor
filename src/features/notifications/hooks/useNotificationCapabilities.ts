import { useEffect, useState } from 'react'
import { detectCapabilities } from '../lib/capabilities'
import type { NotificationCapabilities } from '../lib/capabilities'
import { notificationSettingsRepo } from '../../../shared/db/repositories'

// Re-evaluated on mount and on visibilitychange (catches "user just
// installed the PWA and returned") rather than trusting a cached snapshot —
// capability state can change independently of anything this app does.
export function useNotificationCapabilities() {
  const [capabilities, setCapabilities] = useState<NotificationCapabilities>(detectCapabilities)

  useEffect(() => {
    const refresh = () => {
      const next = detectCapabilities()
      setCapabilities(next)
      void notificationSettingsRepo.update({ permissionStatusCache: next.permission, capabilitySnapshot: next })
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    await Notification.requestPermission()
    setCapabilities(detectCapabilities())
  }

  return { capabilities, requestPermission }
}
