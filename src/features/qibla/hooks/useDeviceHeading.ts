import { useEffect, useState } from 'react'

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported'

// Device compass heading (0 = North), where available. iOS requires an
// explicit user-gesture permission request (DeviceOrientationEvent.
// requestPermission) separate from any other permission prompt; desktop
// browsers generally have no orientation sensor at all, in which case the
// Qibla screen falls back to a static "bearing from North" display.
export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null)
  const [permission, setPermission] = useState<PermissionState>('unknown')

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermission('unsupported')
      return
    }

    const handleOrientation = (event: Event) => {
      const e = event as WebkitDeviceOrientationEvent
      if (typeof e.webkitCompassHeading === 'number') {
        setHeading(e.webkitCompassHeading)
      } else if (e.absolute && e.alpha !== null) {
        setHeading((360 - e.alpha) % 360)
      }
    }

    // Non-iOS browsers (or iOS versions that don't require it) don't expose
    // requestPermission at all — subscribe directly in that case.
    const RequestableEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    if (typeof RequestableEvent.requestPermission !== 'function') {
      setPermission('granted')
      window.addEventListener('deviceorientationabsolute', handleOrientation)
      window.addEventListener('deviceorientation', handleOrientation)
      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation)
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [])

  const requestPermission = async () => {
    const RequestableEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    if (typeof RequestableEvent.requestPermission !== 'function') return
    try {
      const result = await RequestableEvent.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        const handleOrientation = (event: Event) => {
          const e = event as WebkitDeviceOrientationEvent
          if (typeof e.webkitCompassHeading === 'number') {
            setHeading(e.webkitCompassHeading)
          } else if (e.alpha !== null) {
            setHeading((360 - e.alpha) % 360)
          }
        }
        window.addEventListener('deviceorientation', handleOrientation)
      }
    } catch {
      setPermission('denied')
    }
  }

  const needsPermissionRequest =
    permission === 'unknown' &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'

  return { heading, permission, needsPermissionRequest, requestPermission }
}
