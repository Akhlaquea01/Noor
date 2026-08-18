import { useEffect } from 'react'
import { usePreferencesStore } from '../state/preferencesStore'

// Applies theme/font-scale/high-contrast/reduced-motion preferences to the
// document root as CSS custom properties + data attributes, so every
// component picks them up via the tokens already defined in index.css
// without each one re-reading the store.
export function useApplyPreferences() {
  const preferences = usePreferencesStore((s) => s.preferences)

  useEffect(() => {
    const root = document.documentElement
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', preferences.theme)
    }
    root.style.setProperty('--font-scale', String(preferences.fontScale))
    root.classList.toggle('high-contrast', preferences.highContrast)
    root.classList.toggle('force-reduced-motion', preferences.reducedMotion)
    root.lang = preferences.language
  }, [preferences])
}
