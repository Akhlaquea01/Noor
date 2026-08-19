import { useEffect, useState } from 'react'

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported'

function handleOrientation(event: Event, setHeading: (n: number) => void) {
  const e = event as WebkitDeviceOrientationEvent
  if (typeof e.webkitCompassHeading === 'number') {
    setHeading(e.webkitCompassHeading)
  } else if (e.alpha !== null) {
    setHeading((360 - e.alpha) % 360)
  }
}

// Device compass heading (0 = North), where available. iOS requires an
// explicit user-gesture permission request (DeviceOrientationEvent.
// requestPermission) separate from any other permission prompt; desktop
// browsers generally have no orientation sensor at all, in which case the
// Qibla screen falls back to a static "bearing from North" display.
export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null)
  const [permission, setPermission] = useState<PermissionState>('unknown')

  const isRequestable = () =>
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'

  // Non-iOS browsers (or iOS versions that don't require it) never need an
  // explicit request — mark granted immediately so the effect below
  // subscribes right away.
  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermission('unsupported')
    } else if (!isRequestable()) {
      setPermission('granted')
    }
  }, [])

  // Subscription is driven declaratively by `permission` (not registered
  // imperatively inside requestPermission()) so there is always exactly one
  // listener attached, with guaranteed cleanup on unmount or permission
  // change — the previous version added a listener from inside
  // requestPermission() with no corresponding removal, leaking one more
  // 'deviceorientation' listener every time a user revisited this page and
  // re-triggered the request.
  useEffect(() => {
    if (permission !== 'granted') return
    const listener = (event: Event) => handleOrientation(event, setHeading)
    window.addEventListener('deviceorientationabsolute', listener)
    window.addEventListener('deviceorientation', listener)
    return () => {
      window.removeEventListener('deviceorientationabsolute', listener)
      window.removeEventListener('deviceorientation', listener)
    }
  }, [permission])

  const requestPermission = async () => {
    if (!isRequestable()) return
    const RequestableEvent = DeviceOrientationEvent as unknown as {
      requestPermission: () => Promise<'granted' | 'denied'>
    }
    try {
      const result = await RequestableEvent.requestPermission()
      setPermission(result)
    } catch {
      setPermission('denied')
    }
  }

  const needsPermissionRequest = permission === 'unknown' && isRequestable()

  return { heading, permission, needsPermissionRequest, requestPermission }
}
