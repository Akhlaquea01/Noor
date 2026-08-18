import { describe, it, expect } from 'vitest'
import { calculateQiblaBearing } from './calculateQiblaBearing'

describe('calculateQiblaBearing', () => {
  it('matches the well-known bearing from London (~119° from North)', () => {
    const bearing = calculateQiblaBearing({ lat: 51.5074, lng: -0.1278 })
    expect(bearing).toBeGreaterThan(117)
    expect(bearing).toBeLessThan(121)
  })

  it('matches the well-known bearing from New York (~58° from North)', () => {
    const bearing = calculateQiblaBearing({ lat: 40.7128, lng: -74.006 })
    expect(bearing).toBeGreaterThan(56)
    expect(bearing).toBeLessThan(60)
  })

  it('points due south (180°) from a point directly north of the Kaaba on the same meridian', () => {
    const bearing = calculateQiblaBearing({ lat: 30, lng: 39.8262 })
    expect(bearing).toBeCloseTo(180, 0)
  })

  it('always returns a value in [0, 360)', () => {
    const points = [
      { lat: -33.8688, lng: 151.2093 }, // Sydney
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: -1.2921, lng: 36.8219 }, // Nairobi
    ]
    for (const p of points) {
      const bearing = calculateQiblaBearing(p)
      expect(bearing).toBeGreaterThanOrEqual(0)
      expect(bearing).toBeLessThan(360)
    }
  })
})
