import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'

/**
 * Serves the Vercel functions in /api during `npm run dev`, so you don't need
 * the Vercel CLI locally. In production Vercel runs /api/*.ts directly.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const route = url.pathname.replace(/^\/+|\/+$/g, '')
        if (!/^[a-z0-9-]+$/.test(route)) return next()
        let mod: { default: (req: unknown, res: unknown) => unknown }
        try {
          mod = (await server.ssrLoadModule(`/api/${route}.ts`)) as typeof mod
        } catch {
          return next()
        }
        let raw = ''
        for await (const chunk of req) raw += chunk
        let body: unknown = undefined
        try {
          body = raw ? JSON.parse(raw) : undefined
        } catch {
          body = raw
        }
        const vreq = Object.assign(req, { query: Object.fromEntries(url.searchParams), body })
        const vres = Object.assign(res, {
          status(code: number) {
            res.statusCode = code
            return vres
          },
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
            return vres
          },
        })
        await mod.default(vreq, vres)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make server-only secrets (GEMINI_API_KEY) from .env available to the dev API.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), localApi()],
  }
})
