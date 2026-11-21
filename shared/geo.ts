import type { FoodResource, FoodResourceWithDistance, LatLng, WeeklyHours } from './types.js'

/** USF Tampa campus (Marshall Student Center area). Default map centre. */
export const USF_TAMPA: LatLng = { lat: 28.0636, lng: -82.4134 }

const EARTH_RADIUS_MILES = 3958.8

/** Great-circle distance in miles (haversine). */
export function distanceMiles(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h))
}

/** Day of week and minutes since midnight in Tampa's time zone. */
export function tampaClock(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return { day: days.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function isOpenAt(hours: WeeklyHours, now: Date): boolean {
  const { day, minutes } = tampaClock(now)
  const slots = hours[day as keyof WeeklyHours] ?? []
  return slots.some((s) => minutes >= toMinutes(s.open) && minutes < toMinutes(s.close))
}

export function withDistance(
  resources: FoodResource[],
  from: LatLng,
  now: Date = new Date(),
): FoodResourceWithDistance[] {
  return resources
    .map((r) => ({
      ...r,
      distanceMiles: Math.round(distanceMiles(from, r.location) * 10) / 10,
      openNow: isOpenAt(r.hours, now),
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
}

/** Google Maps directions link (opens the Maps app on phones). Defaults to transit for students without cars. */
export function directionsUrl(to: LatLng, travelmode: 'transit' | 'walking' | 'driving' = 'transit'): string {
  const params = new URLSearchParams({ api: '1', destination: `${to.lat},${to.lng}`, travelmode })
  return `https://www.google.com/maps/dir/?${params}`
}
