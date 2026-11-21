import type { ApiRequest, ApiResponse } from '../server/http.js'
import { listFoodResources, parseLocation } from '../server/foodResources.js'
import { fail, HttpError, ok } from '../server/respond.js'

// GET /api/food-resources?lat=..&lng=..  (defaults to USF Tampa)
export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json(fail('Method not allowed'))
  try {
    const from = parseLocation(req.query.lat, req.query.lng)
    const data = listFoodResources(from)
    return res.status(200).json(ok(data, { count: data.length, from }))
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    return res.status(status).json(fail(err instanceof HttpError ? err.message : 'Something went wrong'))
  }
}
