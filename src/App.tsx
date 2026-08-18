import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { usePreferencesStore } from './shared/state/preferencesStore'
import { useQuranProgressStore } from './shared/state/quranProgressStore'
import { useApplyPreferences } from './shared/hooks/useApplyPreferences'
import { useNotificationScheduler } from './features/notifications/hooks/useNotificationScheduler'
import { appMetaRepo } from './shared/db/repositories'

function App() {
  useApplyPreferences()
  useNotificationScheduler()

  useEffect(() => {
    void usePreferencesStore.getState().hydrate()
    void useQuranProgressStore.getState().hydrate()
    void appMetaRepo.ensureInitialized()
  }, [])

  return <RouterProvider router={router} />
}

export default App
