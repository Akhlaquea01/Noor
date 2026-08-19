import { useEffect } from 'react'
import { useLocationStore } from '../state/locationStore'
import type { GeoPoint, LocationSource } from '../state/locationStore'

export type { GeoPoint, LocationSource }

// Thin wrapper kept for existing call sites — the actual state now lives in
// a shared store (see shared/state/locationStore.ts) so useNextPrayer,
// QiblaPage, and the notification scheduler all read the same fetch
// instead of each triggering their own.
export function useLocation() {
  const location = useLocationStore((s) => s.location)
  const source = useLocationStore((s) => s.source)
  const loading = useLocationStore((s) => s.loading)
  const error = useLocationStore((s) => s.error)
  const initialized = useLocationStore((s) => s.initialized)
  const refresh = useLocationStore((s) => s.refresh)

  useEffect(() => {
    if (!initialized) refresh()
  }, [initialized, refresh])

  return { location, source, loading, error, refresh }
}
