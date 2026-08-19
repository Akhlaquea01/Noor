import { create } from 'zustand'
import { userPreferencesRepo } from '../db/repositories'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '../db/types'

interface PreferencesState {
  preferences: UserPreferences
  hydrated: boolean
  hydrate: () => Promise<void>
  update: (patch: Partial<UserPreferences>) => Promise<void>
}

// Global store (not per-component state) because theme/fontScale/highContrast
// drive CSS custom properties on the document root, and multiple unrelated
// screens (Settings, Accessibility, Home) all read and write it.
export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: DEFAULT_USER_PREFERENCES,
  hydrated: false,
  async hydrate() {
    const preferences = await userPreferencesRepo.get()
    set({ preferences, hydrated: true })
  },
  // Merges against the store's own in-memory state (get(), updated
  // synchronously by the set() below) rather than re-reading and re-merging
  // from IndexedDB on every call. That matters for rapid successive updates
  // — e.g. typing into latitude then longitude then UTC offset in quick
  // succession — where the previous call's IndexedDB round-trip may not
  // have resolved yet; merging in-memory first means each call always
  // builds on the latest value instead of racing a stale async read.
  async update(patch) {
    const next = { ...get().preferences, ...patch }
    set({ preferences: next })
    await userPreferencesRepo.set(next)
  },
}))
