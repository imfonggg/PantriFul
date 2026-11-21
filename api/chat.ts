import type { ApiRequest, ApiResponse } from '../server/http.js'
import { chat, validateChatRequest } from '../server/chat.js'
import { fail, HttpError, ok } from '../server/respond.js'

// POST /api/chat  { message: string, location?: { lat, lng } }
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json(fail('Method not allowed'))
  try {
    const input = validateChatRequest(req.body)
    const data = await chat(input)
    return res.status(200).json(ok(data))
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(fail(err.message))
    // Log the error type only; never log the user's message (it may contain personal details).
    console.error('chat failed:', err instanceof Error ? err.name : 'unknown')
    return res.status(502).json(fail('The assistant is unavailable right now. Please try again.'))
  }
}
