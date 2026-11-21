# PantriFul — Claude notes

Hackathon app (Gemini API track): helps people around USF Tampa / Hillsborough County find free food.
Built from the team's Lovable app (TanStack Start + Supabase) plus a Gemini assistant. See AGENTS.md
for the Lovable-managed parts (don't hand-edit generated files, migrations or secrets).

- Food data: `src/data/directory.json` + `src/data/foodResources.ts`. Filtering in `src/data/resourceFilters.ts`.
- Gemini assistant: `src/lib/assistant.functions.ts` (server function; `GEMINI_API_KEY` stays server-side),
  prompt/validation in `src/data/assistant.ts`, UI in `src/components/AssistantPanel.tsx`.
  Gemini may only recommend ids from the candidate list (filtered server-side). Never log user messages.
- Env vars: see `.env.example`. Never commit `.env`.
- Deploy: Vercel builds with `NITRO_PRESET=vercel` (see `vercel.json`); Lovable hosting builds for Cloudflare.
- Checks: `npx vitest run`, `npx tsc --noEmit`, `npm run build`.
- Commits: conventional format (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
