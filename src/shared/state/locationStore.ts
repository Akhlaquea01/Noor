import { create } from 'zustand'
import { qiblaCacheRepo } from '../db/repositories'
import { usePreferencesStore } from './preferencesStore'

export interface GeoPoint {
  lat: number
  lng: number
}

export type LocationSource = 'gps' | 'manual' | 'cached' | null

interface LocationState {
  location: GeoPoint | null
  source: LocationSource
  loading: boolean
  error: string | null
  initialized: boolean
  refresh: () => void
}

// A shared store, not a plain hook — useNextPrayer, QiblaPage, and the
// globally-mounted notification scheduler each used to call a per-component
// useLocation() hook independently, so a single app load could fire two or
// three simultaneous, redundant navigator.geolocation.getCurrentPosition()
// requests. One shared fetch now serves all of them.
export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  source: null,
  loading: true,
  error: null,
  initialized: false,
  refresh: () => {
    set({ initialized: true })
    const { preferences } = usePreferencesStore.getState()

    if (preferences.locationMode === 'manual') {
      if (preferences.manualLocation) {
        set({
          location: { lat: preferences.manualLocation.lat, lng: preferences.manualLocation.lng },
          source: 'manual',
          error: null,
          loading: false,
        })
      } else {
        set({ error: 'No manual location set. Add one in Settings.', loading: false })
      }
      return
    }

    if (!('geolocation' in navigator)) {
      set({ error: 'Geolocation is not supported on this device.', loading: false })
      return
    }

    set({ loading: true })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude }
        set({ location: point, source: 'gps', error: null, loading: false })
        void qiblaCacheRepo.update({ lastLocation: point, computedAt: Date.now() })
      },
      () => {
        void qiblaCacheRepo.get().then((cache) => {
          if (cache.lastLocation) {
            set({ location: cache.lastLocation, source: 'cached', error: null, loading: false })
          } else {
            set({ error: 'Location unavailable. Enable location access or set one manually in Settings.', loading: false })
          }
        })
      },
      { timeout: 8000, maximumAge: 60 * 60 * 1000 }
    )
  },
}))

// React to location-mode/manual-location changes made *after* the first
// request (e.g. switching GPS -> manual in Settings) without eagerly
// fetching before any screen has asked for a location at all.
usePreferencesStore.subscribe((state, prevState) => {
  if (!useLocationStore.getState().initialized) return
  const a = state.preferences
  const b = prevState.preferences
  if (
    a.locationMode !== b.locationMode ||
    a.manualLocation?.lat !== b.manualLocation?.lat ||
    a.manualLocation?.lng !== b.manualLocation?.lng
  ) {
    useLocationStore.getState().refresh()
  }
})
