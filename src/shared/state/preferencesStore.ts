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
export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: DEFAULT_USER_PREFERENCES,
  hydrated: false,
  async hydrate() {
    const preferences = await userPreferencesRepo.get()
    set({ preferences, hydrated: true })
  },
  async update(patch) {
    const next = await userPreferencesRepo.update(patch)
    set({ preferences: next })
  },
}))
