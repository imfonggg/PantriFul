import type { ApiResponse } from '../shared/types.js'

export const ok = <T>(data: T, meta: Record<string, unknown> = {}): ApiResponse<T> => ({
  success: true,
  data,
  error: null,
  meta,
})

export const fail = (error: string, meta: Record<string, unknown> = {}): ApiResponse<never> => ({
  success: false,
  data: null,
  error,
  meta,
})

/** Thrown by handlers to return a specific HTTP status with a safe message. */
export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
