import { describe, expect, it } from 'vitest'
import { directionsUrl, distanceMiles, isOpenAt, USF_TAMPA, withDistance } from '../shared/geo.js'
import { FOOD_RESOURCES } from '../shared/foodResources.js'

describe('distanceMiles', () => {
  it('is zero for the same point', () => {
    expect(distanceMiles(USF_TAMPA, USF_TAMPA)).toBe(0)
  })
  it('USF to downtown Tampa is roughly 7 miles', () => {
    const d = distanceMiles(USF_TAMPA, { lat: 27.9506, lng: -82.4572 })
    expect(d).toBeGreaterThan(6)
    expect(d).toBeLessThan(9)
  })
})

describe('isOpenAt', () => {
  const hours = { 1: [{ open: '09:00', close: '17:00' }] } // Mondays only
  it('is open on Monday 10am Tampa time', () => {
    expect(isOpenAt(hours, new Date('2026-11-23T15:00:00Z'))).toBe(true) // 10:00 EST
  })
  it('is closed after closing time', () => {
    expect(isOpenAt(hours, new Date('2026-11-23T22:30:00Z'))).toBe(false) // 17:30 EST
  })
  it('is closed on a day with no hours', () => {
    expect(isOpenAt(hours, new Date('2026-11-24T15:00:00Z'))).toBe(false) // Tuesday
  })
})

describe('withDistance', () => {
  it('sorts nearest first', () => {
    const list = withDistance(FOOD_RESOURCES, USF_TAMPA)
    const distances = list.map((r) => r.distanceMiles)
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })
})

describe('directionsUrl', () => {
  it('builds a Google Maps directions link', () => {
    expect(directionsUrl({ lat: 28.1, lng: -82.4 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=28.1%2C-82.4&travelmode=transit',
    )
  })
})

describe('FOOD_RESOURCES data', () => {
  it('has unique ids', () => {
    const ids = FOOD_RESOURCES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('places are all in the Tampa Bay area', () => {
    for (const r of FOOD_RESOURCES) {
      expect(distanceMiles(USF_TAMPA, r.location)).toBeLessThan(20)
    }
  })
  it('hours are well formed', () => {
    for (const r of FOOD_RESOURCES) {
      for (const slots of Object.values(r.hours)) {
        for (const s of slots ?? []) {
          expect(s.open).toMatch(/^\d{2}:\d{2}$/)
          expect(s.close > s.open).toBe(true)
        }
      }
    }
  })
  it('places with no weekly hours explain their schedule in notes', () => {
    for (const r of FOOD_RESOURCES) {
      if (Object.keys(r.hours).length === 0) expect(r.notes).toBeTruthy()
    }
  })
})
