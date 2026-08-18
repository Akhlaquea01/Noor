import { useSyncExternalStore } from 'react'

// 'syncing' and 'synced' are reserved for a future Sync Mode (cloud account
// sync) and are not produced by this hook yet — only 'online'/'offline' are
// live in the local-only MVP. Kept as part of the type now so the indicator
// component and its consumers don't need to change shape later.
export type ConnectivityState = 'online' | 'offline' | 'syncing' | 'synced'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot(): ConnectivityState {
  return navigator.onLine ? 'online' : 'offline'
}

function getServerSnapshot(): ConnectivityState {
  return 'online'
}

export function useOnlineStatus(): ConnectivityState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
