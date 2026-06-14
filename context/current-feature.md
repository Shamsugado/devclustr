# Current Feature: Auth Phase 2 - Email/Password Credentials Provider

## Status

In Progress

## Goals

- Add NextAuth Credentials provider for email/password authentication
- Ensure `password` field exists on the `User` model (migration if needed — already added in Phase 1 seed work, verify)
- Update `src/auth.config.ts` with a Credentials provider placeholder (`authorize: () => null`)
- Update `src/auth.ts` to override the Credentials provider with real bcrypt validation against the DB
- Create registration API route `POST /api/auth/register` that:
  - Accepts name, email, password, confirmPassword
  - Validates passwords match
  - Checks if user already exists
  - Hashes password with bcryptjs
  - Creates user in database
  - Returns success/error response

## Notes

- Split config pattern: keep `auth.config.ts` edge-compatible with a placeholder Credentials provider; `auth.ts` overrides it with bcrypt-based `authorize`.
- bcryptjs is already installed; `password` column already exists on `users` table from seed migration (verify still matches).
- Testing:
  1. `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"password123","confirmPassword":"password123"}'`
  2. Go to `/api/auth/signin`
  3. Sign in with email/password
  4. Verify redirect to `/dashboard`
  5. Verify GitHub OAuth still works
- Reference: https://authjs.dev/getting-started/authentication/credentials

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-05-28** — Initial Next.js 16 + Tailwind CSS v4 project setup. Git initialized and pushed to GitHub (`git@github.com:Shamsugado/devclustr.git`).
- **2026-06-02** — Dashboard UI Phase 1 complete. ShadCN UI initialized (Tailwind v4 compatible). Dashboard route at `/dashboard` with dark mode by default. Top bar with DS logo, centered search input, New Collection and New Item buttons. Sidebar and Main placeholders in place.
- **2026-06-02** — Dashboard UI Phase 2 complete. Collapsible sidebar with Quick Access, Item Types, and Collections (Favorites + Recent) sections. User avatar area at bottom. Mobile hamburger in TopBar opens a full drawer overlay. Item type links route to `/items/[type]` (placeholder).
- **2026-06-03** — Dashboard UI Phase 3 complete. Main content area with 4 stats cards (items, collections, favorite items, favorite collections), recent collections grid, pinned items section, and 10 recent items grid. All data sourced from mock data.
- **2026-06-04** — Prisma 7 + Neon PostgreSQL setup complete. Full schema with all data models, NextAuth models, indexes, and cascade deletes. Initial migration applied to Neon dev branch. Singleton client at `src/lib/prisma.ts` using `PrismaNeon` adapter. System item types seeded. `db:*` npm scripts added.
- **2026-06-04** — Seed data complete. Demo user (demo@devstash.io, bcrypt password) with `password` column added to `users` table via migration. 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), and 18 items seeded. `scripts/test-db.ts` updated to verify all seed data.
- **2026-06-05** — Stats & Sidebar live data complete. Dashboard stats, pinned/recent items, and recent collections now sourced from Neon DB. `src/lib/db/items.ts` and `src/lib/db/collections.ts` created. Sidebar renders system item types from DB with icons/colors; favorite collections show a star, recent collections show a dominant-type colored circle. "View all collections" link added. Dashboard layout and page converted to async server components. UI font sizes bumped throughout for readability.
- **2026-06-10** — Pro badge on sidebar complete. Added ShadCN `Badge` component (`src/components/ui/badge.tsx`). Sidebar `NavItem` now supports a `pro` flag that renders a subtle outline "PRO" badge; Files and Images item types are marked as pro-only.
- **2026-06-14** — Auth Phase 1 complete. NextAuth v5 (`next-auth@beta`) + `@auth/prisma-adapter` installed. Split config pattern: `src/auth.config.ts` (edge-compatible, GitHub provider) and `src/auth.ts` (Prisma adapter, JWT session, session callback adds `user.id`). Route handler at `src/app/api/auth/[...nextauth]/route.ts`. `src/proxy.ts` protects `/dashboard/*`, redirecting unauthenticated users to NextAuth's default sign-in page with `callbackUrl`. `src/types/next-auth.d.ts` extends `Session.user` with `id`.
