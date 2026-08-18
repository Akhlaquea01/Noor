import type { GeoPoint } from '../../../shared/hooks/useLocation'

const KAABA: GeoPoint = { lat: 21.4225, lng: 39.8262 }

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

// Great-circle initial bearing from `from` to the Kaaba, normalized to 0-360.
export function calculateQiblaBearing(from: GeoPoint): number {
  const phi1 = toRad(from.lat)
  const phi2 = toRad(KAABA.lat)
  const deltaLambda = toRad(KAABA.lng - from.lng)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = Math.atan2(y, x)

  return (toDeg(theta) + 360) % 360
}
