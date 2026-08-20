import { useEffect, useRef, useState } from 'react'

interface WebkitDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported'

// Shortest signed delta from `from` to `to` on a 0-360 circle (e.g. 350 -> 10
// is +20, not -340) — needed so smoothing doesn't make the needle spin the
// long way around whenever a reading crosses the North/0 boundary.
function shortestAngleDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180
}

function readCompassHeading(event: Event): number | null {
  const e = event as WebkitDeviceOrientationEvent
  if (typeof e.webkitCompassHeading === 'number') {
    // iOS: already an absolute, North-referenced compass heading.
    return e.webkitCompassHeading
  }
  // A plain (non-absolute) `deviceorientation` event's `alpha` is relative
  // to whatever orientation the device happened to have when tracking
  // started, not to North — on browsers where only this event fires
  // (rather than `deviceorientationabsolute`), trusting it as a compass
  // heading would show a confidently wrong Qibla direction instead of
  // falling back to the honest "live compass unavailable" message.
  if (e.absolute && e.alpha !== null) {
    return (360 - e.alpha) % 360
  }
  return null
}

// Device compass heading (0 = North), where available. iOS requires an
// explicit user-gesture permission request (DeviceOrientationEvent.
// requestPermission) separate from any other permission prompt; desktop
// browsers generally have no orientation sensor at all, in which case the
// Qibla screen falls back to a static "bearing from North" display.
export function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null)
  const [permission, setPermission] = useState<PermissionState>('unknown')
  const [timedOut, setTimedOut] = useState(false)
  const headingReceivedRef = useRef(false)

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
    headingReceivedRef.current = false
    setTimedOut(false)

    const listener = (event: Event) => {
      const reading = readCompassHeading(event)
      if (reading === null) return
      headingReceivedRef.current = true
      setHeading((prev) => {
        if (prev === null) return reading
        // Light exponential smoothing (25% weight per reading) — raw
        // orientation events are noisy enough on their own to make the
        // needle visibly jitter, especially at the ~60Hz some devices emit.
        return (prev + shortestAngleDelta(prev, reading) * 0.25 + 360) % 360
      })
    }
    window.addEventListener('deviceorientationabsolute', listener)
    window.addEventListener('deviceorientation', listener)

    // Devices that expose the DeviceOrientationEvent constructor but have no
    // real sensor (common on laptops) never fire an event at all — without
    // this, the UI would be stuck forever on "move your device to
    // calibrate," which no amount of moving can ever satisfy.
    const timeout = setTimeout(() => {
      if (!headingReceivedRef.current) setTimedOut(true)
    }, 2500)

    return () => {
      window.removeEventListener('deviceorientationabsolute', listener)
      window.removeEventListener('deviceorientation', listener)
      clearTimeout(timeout)
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

  return { heading, permission, needsPermissionRequest, requestPermission, timedOut }
}
