import { describe, expect, it } from 'vitest'
import { parseChatResult, validateChatRequest } from '../server/chat.js'
import { parseLocation } from '../server/foodResources.js'
import { HttpError } from '../server/respond.js'

describe('validateChatRequest', () => {
  it('accepts a message', () => {
    expect(validateChatRequest({ message: '  need food  ' })).toEqual({ message: 'need food', location: undefined })
  })
  it('rejects an empty message', () => {
    expect(() => validateChatRequest({ message: ' ' })).toThrow(HttpError)
  })
  it('rejects a bad location', () => {
    expect(() => validateChatRequest({ message: 'hi', location: { lat: 'x', lng: 1 } })).toThrow(HttpError)
  })
  it('rejects very long messages', () => {
    expect(() => validateChatRequest({ message: 'a'.repeat(2000) })).toThrow(HttpError)
  })
})

describe('parseChatResult', () => {
  const known = new Set(['a', 'b'])
  it('keeps only known ids', () => {
    expect(parseChatResult('{"reply":"hi","recommendedIds":["a","zzz"]}', known)).toEqual({
      reply: 'hi',
      recommendedIds: ['a'],
    })
  })
  it('falls back to raw text when not JSON', () => {
    expect(parseChatResult('plain text', known)).toEqual({ reply: 'plain text', recommendedIds: [] })
  })
})

describe('parseLocation', () => {
  it('defaults to USF when missing', () => {
    expect(parseLocation(undefined, undefined).lat).toBeCloseTo(28.06, 1)
  })
  it('rejects garbage', () => {
    expect(() => parseLocation('abc', '1')).toThrow(HttpError)
  })
})
