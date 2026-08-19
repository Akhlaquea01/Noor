import { create } from 'zustand'
import { detectCapabilities } from '../lib/capabilities'
import { notificationSettingsRepo } from '../../../shared/db/repositories'
import type { NotificationCapabilities } from '../lib/capabilities'

interface NotificationCapabilitiesState {
  capabilities: NotificationCapabilities
  refresh: () => void
  requestPermission: () => Promise<void>
}

// A Zustand store (not per-component local state) so every consumer —
// the Settings notifications page and the capability banner rendered
// inside it — reads the exact same live value. Previously each called
// useNotificationCapabilities() independently, which used a plain
// useState: clicking "Allow" in the banner updated only the banner's own
// copy, so the settings page's checkboxes never found out permission had
// been granted and stayed disabled until a full remount. That was the
// actual "notification checkboxes don't work" bug, not a permissions
// issue.
export const useNotificationCapabilitiesStore = create<NotificationCapabilitiesState>((set) => ({
  capabilities: detectCapabilities(),
  refresh: () => {
    const next = detectCapabilities()
    set({ capabilities: next })
    void notificationSettingsRepo.update({ permissionStatusCache: next.permission, capabilitySnapshot: next })
  },
  requestPermission: async () => {
    if (typeof Notification === 'undefined') return
    await Notification.requestPermission()
    const next = detectCapabilities()
    set({ capabilities: next })
    void notificationSettingsRepo.update({ permissionStatusCache: next.permission, capabilitySnapshot: next })
  },
}))

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') useNotificationCapabilitiesStore.getState().refresh()
  })
}
