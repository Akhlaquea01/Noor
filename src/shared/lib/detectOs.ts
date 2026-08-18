export type OsHint = 'windows' | 'macos' | 'ios' | 'android' | 'other'

export function detectOs(): OsHint {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Mac OS X/.test(ua) && !/iPad|iPhone|iPod/.test(ua)) return 'macos'
  if (/Windows/.test(ua)) return 'windows'
  return 'other'
}
