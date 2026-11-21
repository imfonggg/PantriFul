# PantriFul

Find free food near the University of South Florida (Tampa). A map and list of nearby food pantries,
food banks and free meals, plus a Gemini-powered assistant that matches what you need to the right place.

Built for a hackathon (Gemini API track). Supports UN SDG 2: Zero Hunger.

## Stack

- **Front end:** React + TypeScript + Vite, Tailwind CSS, Google Maps (`@vis.gl/react-google-maps`)
- **API:** Vercel serverless functions in `api/` (TypeScript), Gemini via `@google/genai`
- **Hosting:** Vercel free tier (front end and API in one deploy)

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # http://localhost:5173 (API routes work locally too)
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with the `/api` routes |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Type check and production build |
| `npm run lint` | Lint (oxlint) |

## API

Every response has the shape `{ success, data, error, meta }`.

| Route | Description |
|---|---|
| `GET /api/food-resources?lat=&lng=` | Food resources sorted by distance (defaults to USF), with `openNow` |
| `POST /api/chat` `{ message, location? }` | Gemini recommends resources: `{ reply, recommendedIds }` |

## Project layout

```
api/       Vercel functions (thin HTTP wrappers)
server/    API logic: validation, Gemini call
shared/    Types, seed data and geo helpers used by both sides
src/       React app (src/lib/api.ts is the typed API client)
tests/     Vitest tests
```

## Food resource data

`shared/foodResources.ts` holds the seed list. **Addresses, coordinates and hours are placeholders
until checked.** Confirm each entry on its website or by phone and set `verified: true`.

## Deploy to Vercel

1. Import this GitHub repo at vercel.com/new (framework: Vite, auto-detected).
2. Add `GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` under Settings → Environment Variables.
3. Deploy. Every push to the branch gives a preview URL.

## Adding the designed UI

Drop components into `src/components/` (or `src/features/<feature>/`) and replace the placeholder
`src/App.tsx`. Use `getFoodResources()` and `askAssistant()` from `src/lib/api.ts` for data.
