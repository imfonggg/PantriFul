# PantriFul — Claude notes

Hackathon prototype (deadline-driven). Helps people around USF Tampa find free food; Gemini API track.
See README.md for commands, layout and API.

## Rules

- Keep it simple and cheap to host: one Vercel project, serverless functions in `api/`, no database yet.
- `api/*.ts` stay thin; logic lives in `server/`, shared types/data in `shared/`.
- Relative imports in `api/`, `server/`, `shared/` use `.js` extensions (Node ESM on Vercel).
- Every API response uses `{ success, data, error, meta }` (helpers in `server/respond.ts`).
- Validate all input at the API boundary. Never log user messages or personal data.
- Secrets only in env vars. `GEMINI_API_KEY` is server-only; only `VITE_*` vars reach the browser.
- Gemini may only recommend resources from our list (ids are filtered server-side).
- Accessibility: keyboard and screen-reader usable, readable on low-end phones.
- Tests: add Vitest tests for logic in `server/` and `shared/`; full TDD is relaxed for the hackathon.
- Commits: conventional format (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Out of scope for the prototype

Accounts, donor listings, claim/pickup flow, database, payments, native apps.
