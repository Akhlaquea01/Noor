import { useEffect } from 'react'
import { useNotificationCapabilitiesStore } from '../state/notificationCapabilitiesStore'

// Thin wrapper kept for the existing call sites — the actual state now
// lives in a shared Zustand store (see notificationCapabilitiesStore.ts)
// so every consumer sees the same live capabilities/permission value
// instead of each hook call holding its own disconnected copy.
export function useNotificationCapabilities() {
  const capabilities = useNotificationCapabilitiesStore((s) => s.capabilities)
  const refresh = useNotificationCapabilitiesStore((s) => s.refresh)
  const requestPermission = useNotificationCapabilitiesStore((s) => s.requestPermission)

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { capabilities, requestPermission }
}
