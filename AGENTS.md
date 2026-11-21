<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep shared navigation, help and language state around the root Outlet so they remain available across every page.
- Keep food data in a dated, source-linked static snapshot; never infer coordinates, eligibility or dietary availability when source details are missing.
- Use browser-safe resource filtering and Google Maps direction URLs; ordinary browsing must not require authentication or billable server calls.
- Translate app-owned text locally into the languages offered in the language picker; retain provider names and street addresses as published for accurate destinations.
- Use a deterministic, dismissible tutorial rather than AI for navigation guidance so it is available without accounts, costs or hallucinated instructions.
- Keep optional profile and bookmark writes behind authenticated server functions and owner-scoped RLS; empty signup profiles must not auto-save browsing preferences.
- Keep provider donation URLs source-verified and separate from the application's own donation fund; missing checkout setup must never simulate payment success.
- Paginate the displayed list and map together so the footer stays reachable and map selection always matches the current results.
- Keep private account pages under the client-only authenticated layout; each private server function independently verifies identity to protect directly callable endpoints.
- Keep published weekly schedules as a source-derived companion snapshot so monthly restrictions are displayed without falsely marking recurring events open.
- Keep provider visit details in a dated bilingual companion snapshot with per-fact source URLs; omit unpublished rules and dietary guarantees so missing evidence never becomes an access barrier.
- Treat the ZIP field as an exact published-address filter, not a inferred service-area or distance calculation; ordinary browsing must remain free of geocoding calls.
- Render Leaflet popup actions through React portals so shared language context remains available and Directions uses the same copy-link flow everywhere.
