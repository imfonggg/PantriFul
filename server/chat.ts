import { GoogleGenAI, Type } from '@google/genai'
import { USF_TAMPA } from '../shared/geo.js'
import type { ChatRequest, ChatResult, FoodResourceWithDistance } from '../shared/types.js'
import { listFoodResources } from './foodResources.js'
import { HttpError } from './respond.js'

const MAX_MESSAGE_LENGTH = 1000
const DEFAULT_MODEL = 'gemini-3.8-flash'

export function validateChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Request body must be JSON')
  const { message, location } = body as Record<string, unknown>
  if (typeof message !== 'string' || !message.trim()) throw new HttpError(400, 'message is required')
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(400, `message must be under ${MAX_MESSAGE_LENGTH} characters`)
  }
  let loc: ChatRequest['location']
  if (location !== undefined) {
    const { lat, lng } = (location ?? {}) as Record<string, unknown>
    if (typeof lat !== 'number' || typeof lng !== 'number' || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new HttpError(400, 'location must be { lat, lng }')
    }
    loc = { lat, lng }
  }
  return { message: message.trim(), location: loc }
}

function buildSystemPrompt(resources: FoodResourceWithDistance[], now: Date): string {
  const localTime = now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  const catalog = resources.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    address: r.address,
    distanceMiles: r.distanceMiles,
    openNow: r.openNow,
    hours: r.hours,
    eligibility: r.eligibility,
    requirements: r.requirements,
    offers: r.offers,
    notes: r.notes,
  }))
  return [
    'You are PantriFul, a friendly assistant that helps people near the University of South Florida (Tampa) find free food.',
    `Current local time in Tampa: ${localTime}. Hours use 0=Sunday..6=Saturday, 24h local time.`,
    'Only recommend resources from this list, by id. Never invent places, hours or phone numbers.',
    'Some places run monthly or on set days only: read each place\'s notes for the schedule.',
    'Prefer places that are open now or soon, close by, and whose eligibility fits the person.',
    'Keep the reply short (under 120 words), warm and non-judgemental. Mention what to bring if listed.',
    'If nothing fits, say so and suggest calling 211 (Florida help line) for more options.',
    'If the person mentions an emergency or danger, tell them to call 911.',
    `Resources: ${JSON.stringify(catalog)}`,
  ].join('\n')
}

/** Ask Gemini to match the person's needs to resources from our list. */
export async function chat(req: ChatRequest, now: Date = new Date()): Promise<ChatResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new HttpError(503, 'Assistant is not configured (missing GEMINI_API_KEY)')

  const resources = listFoodResources(req.location ?? USF_TAMPA, now)
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    contents: req.message,
    config: {
      systemInstruction: buildSystemPrompt(resources, now),
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['reply', 'recommendedIds'],
      },
    },
  })

  return parseChatResult(response.text ?? '', new Set(resources.map((r) => r.id)))
}

/** Parse Gemini's JSON and drop any ids that aren't in our list. */
export function parseChatResult(text: string, knownIds: Set<string>): ChatResult {
  try {
    const parsed = JSON.parse(text) as Partial<ChatResult>
    const reply = typeof parsed.reply === 'string' ? parsed.reply : ''
    const ids = Array.isArray(parsed.recommendedIds) ? parsed.recommendedIds : []
    return { reply, recommendedIds: ids.filter((id): id is string => typeof id === 'string' && knownIds.has(id)) }
  } catch {
    return { reply: text, recommendedIds: [] }
  }
}
