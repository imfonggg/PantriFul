// Types shared by the front end (src/) and the serverless API (api/, server/).

/** One consistent response shape for every API route. */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  meta: Record<string, unknown>
}

export interface LatLng {
  lat: number
  lng: number
}

/** Opening hours for one day, 24h "HH:MM" local (America/New_York) time. */
export interface DayHours {
  open: string
  close: string
}

/** 0 = Sunday ... 6 = Saturday. Missing day = closed. */
export type WeeklyHours = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayHours[]>>

export type ResourceType = 'pantry' | 'food_bank' | 'hot_meal' | 'mobile_pantry' | 'benefits'

export interface FoodResource {
  id: string
  name: string
  type: ResourceType
  address: string
  location: LatLng
  phone?: string
  website?: string
  hours: WeeklyHours
  /** Who can use it, e.g. "USF students with a valid ID". */
  eligibility: string
  /** What people should bring, e.g. "Photo ID". */
  requirements?: string
  offers: string[]
  /** True once a teammate has confirmed the details by phone or website. */
  verified: boolean
  notes?: string
}

export interface FoodResourceWithDistance extends FoodResource {
  distanceMiles: number
  openNow: boolean
}

export interface ChatRequest {
  message: string
  location?: LatLng
}

export interface ChatResult {
  reply: string
  recommendedIds: string[]
}
