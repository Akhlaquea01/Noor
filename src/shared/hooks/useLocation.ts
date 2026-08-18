import { useEffect, useState } from 'react'
import { qiblaCacheRepo } from '../db/repositories'
import { usePreferencesStore } from '../state/preferencesStore'

export interface GeoPoint {
  lat: number
  lng: number
}

export type LocationSource = 'gps' | 'manual' | 'cached' | null

// Shared by Prayer Times and Qibla — both just need "the user's last known
// coordinates," not two separate geolocation implementations. qiblaCache's
// lastLocation field doubles as the general last-known-location cache (not
// Qibla-specific data) so a location fix works offline even without a fresh
// GPS reading that day.
export function useLocation() {
  const preferences = usePreferencesStore((s) => s.preferences)
  const [location, setLocation] = useState<GeoPoint | null>(null)
  const [source, setSource] = useState<LocationSource>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    if (preferences.locationMode === 'manual') {
      if (preferences.manualLocation) {
        setLocation({ lat: preferences.manualLocation.lat, lng: preferences.manualLocation.lng })
        setSource('manual')
        setError(null)
      } else {
        setError('No manual location set. Add one in Settings.')
      }
      setLoading(false)
      return
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported on this device.')
      setLoading(false)
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude }
        setLocation(point)
        setSource('gps')
        setError(null)
        setLoading(false)
        void qiblaCacheRepo.update({ lastLocation: point, computedAt: Date.now() })
      },
      () => {
        void qiblaCacheRepo.get().then((cache) => {
          if (cache.lastLocation) {
            setLocation(cache.lastLocation)
            setSource('cached')
            setError(null)
          } else {
            setError('Location unavailable. Enable location access or set one manually in Settings.')
          }
          setLoading(false)
        })
      },
      { timeout: 8000, maximumAge: 60 * 60 * 1000 }
    )
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.locationMode, preferences.manualLocation?.lat, preferences.manualLocation?.lng])

  return { location, source, loading, error, refresh }
}
