---
name: project-state-2026-06-11
description: Snapshot of DevStash codebase structure and stage as of 2026-06-11 full audit
metadata:
  type: project
---

DevStash is in a very early stage as of 2026-06-11. Full audit performed covering all existing source files.

**What exists:**
- `src/app/layout.tsx`, `src/app/page.tsx` (minimal placeholder homepage)
- `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx` — main dashboard, server components
- `src/components/dashboard/` — DashboardShell (client), DashboardMain, TopBar (client), Sidebar (client)
- `src/lib/prisma.ts` — Prisma singleton with Neon adapter
- `src/lib/db/items.ts`, `src/lib/db/collections.ts` — data access functions
- `src/lib/utils.ts` — cn() helper
- `src/components/ui/` — shadcn components (badge, button, input) using @base-ui/react
- `prisma/schema.prisma` — full schema incl. NextAuth models, proper indexes already in place
- `prisma/seed.ts`, `scripts/test-db.ts`

**What does NOT exist yet** (do not flag as missing/broken — just unimplemented):
- No NextAuth config (`src/lib/auth.ts`, `src/app/api/auth/`) despite being in planned stack
- No `/api` routes at all
- No `/items`, `/collections`, `/dashboard/favorites`, `/dashboard/recent`, `/settings` pages (sidebar links to these will 404 — expected, in progress)
- No middleware.ts
- No Server Actions yet (`src/actions/`)
- No `src/types/` directory

**Key recurring pattern to watch:** Both `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx` independently query
`prisma.user.findUnique({ where: { email: "demo@devstash.io" } })` as a hardcoded "demo user" stand-in for real auth/session.
This causes a duplicate query per request (layout + page each run it). This is a placeholder pending real auth — flag as
Medium (duplicate query / will need replacing with session lookup), not as a security issue since no auth exists yet.

**.gitignore confirmed correct**: `.env*` is ignored (line 34). `.env.example` contains only placeholders, no real secrets.

**TopBar.tsx**: Search input and "New Collection"/"New Item" buttons are non-functional (no onClick/state) — this is expected
for current UI-shell stage per context/current-feature.md history, not a bug.
