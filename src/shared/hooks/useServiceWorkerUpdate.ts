import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

// Wires the PWA update flow: exposes needRefresh so an "update available"
// banner (built in M10) can prompt the user, and applyUpdate() to accept it.
// Full UI lives in M10 — this hook is registered from app startup in M1 so
// the service worker installs correctly from the very first milestone.
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onOfflineReady() {
        setOfflineReady(true)
      },
    })
    setUpdateSW(() => update)
  }, [])

  return {
    needRefresh,
    offlineReady,
    applyUpdate: () => updateSW?.(true),
  }
}
