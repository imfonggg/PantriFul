// Minimal request/response types for Vercel Node functions. We define them here
// instead of depending on @vercel/node, which pulls in a large, audit-noisy tree.
import type { IncomingMessage, ServerResponse } from 'node:http'

export type ApiRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>
  body: unknown
}

export type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse
  json: (body: unknown) => ApiResponse
}
