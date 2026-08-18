export type PlatformHint = 'ios-safari' | 'android-chrome' | 'desktop' | 'other'
export type CapabilityTier = 'full' | 'limited' | 'unsupported'

export interface NotificationCapabilities {
  notificationApiSupported: boolean
  permission: NotificationPermission | 'unsupported'
  serviceWorkerSupported: boolean
  pushManagerSupported: boolean
  isStandalonePwa: boolean
  platformHint: PlatformHint
  tier: CapabilityTier
}

function detectPlatformHint(): PlatformHint {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) return 'ios-safari'
  if (/Android/.test(ua)) return 'android-chrome'
  if (/Mobi/.test(ua)) return 'other'
  return 'desktop'
}

function detectIsStandalonePwa(): boolean {
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  // iOS Safari's legacy, non-standard flag — not in the DOM lib types.
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

// Never overpromises: iOS Safari requires the PWA to be installed to the
// home screen before Notification.requestPermission() even functions, so a
// non-installed iOS session is reported as 'limited', not 'full', even
// though the Notification API technically exists.
export function detectCapabilities(): NotificationCapabilities {
  const notificationApiSupported = typeof Notification !== 'undefined'
  const serviceWorkerSupported = 'serviceWorker' in navigator
  const pushManagerSupported = serviceWorkerSupported && 'PushManager' in window
  const isStandalonePwa = detectIsStandalonePwa()
  const platformHint = detectPlatformHint()
  const permission: NotificationPermission | 'unsupported' = notificationApiSupported
    ? Notification.permission
    : 'unsupported'

  let tier: CapabilityTier = 'unsupported'
  if (notificationApiSupported && serviceWorkerSupported) {
    tier = platformHint === 'ios-safari' && !isStandalonePwa ? 'limited' : 'full'
  }

  return { notificationApiSupported, permission, serviceWorkerSupported, pushManagerSupported, isStandalonePwa, platformHint, tier }
}
