import { FOOD_RESOURCES } from '../shared/foodResources.js'
import { USF_TAMPA, withDistance } from '../shared/geo.js'
import type { FoodResourceWithDistance, LatLng } from '../shared/types.js'
import { HttpError } from './respond.js'

/** Parse optional ?lat=&lng= query params, falling back to USF Tampa. */
export function parseLocation(lat: unknown, lng: unknown): LatLng {
  if (lat === undefined && lng === undefined) return USF_TAMPA
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
    throw new HttpError(400, 'lat and lng must be valid coordinates')
  }
  return { lat: la, lng: ln }
}

export function listFoodResources(from: LatLng, now: Date = new Date()): FoodResourceWithDistance[] {
  return withDistance(FOOD_RESOURCES, from, now)
}
