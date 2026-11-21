import type { ApiResponse, ChatResult, FoodResourceWithDistance, LatLng } from '../../shared/types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = (await res.json()) as ApiResponse<T>
  if (!body.success || body.data === null) throw new Error(body.error ?? `Request failed (${res.status})`)
  return body.data
}

export function getFoodResources(from?: LatLng): Promise<FoodResourceWithDistance[]> {
  const qs = from ? `?lat=${from.lat}&lng=${from.lng}` : ''
  return request(`/api/food-resources${qs}`)
}

export function askAssistant(message: string, location?: LatLng): Promise<ChatResult> {
  return request('/api/chat', { method: 'POST', body: JSON.stringify({ message, location }) })
}
