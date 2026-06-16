# Current Feature: Email Verification Toggle

## Status

In Progress

## Goals

- Add a single toggle (env variable) to enable or disable email verification for new registrations
- When disabled: users can sign in immediately after registering, no email is sent
- When enabled: current flow applies — Resend sends a verification link, sign-in is blocked until verified
- GitHub OAuth users are unaffected by the toggle either way

## Notes

- Context: no custom domain is linked to Resend yet, so only `shamsudeengado@gmail.com` (the Resend account email) can receive verification emails during development. The toggle lets other testers register without being blocked.
- Approach: use an env variable (e.g. `EMAIL_VERIFICATION_ENABLED=true`) — clean, zero-code-change to flip, and works across environments (dev off, prod on).
- Touch points: `POST /api/auth/register` (skip token creation + email send when disabled), `src/auth.ts` Credentials `authorize` (skip the `emailVerified` check when disabled), and possibly `/check-email` redirect after registration.

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
- **2026-06-14** — Auth Phase 2 complete. Added NextAuth Credentials provider for email/password: placeholder in `src/auth.config.ts`, real bcrypt-based `authorize` against the DB in `src/auth.ts`. New `POST /api/auth/register` route validates input, checks for existing users, hashes passwords with bcryptjs, and creates the user. Verified registration, sign-in/sign-out, `callbackUrl` redirect to `/dashboard`, wrong-password rejection, and that GitHub OAuth still works.
- **2026-06-14** — Auth Phase 3 complete. Custom `/sign-in` page (email/password + "Sign in with GitHub", error display, link to register) and `/register` page (name/email/password/confirm, email format + password match validation, posts to `/api/auth/register`, redirects to sign-in). New reusable `UserAvatar` component (GitHub image or initials fallback). Sidebar bottom area now shows a dropdown with "Profile" (links to new `/profile` route) and "Sign out". `src/proxy.ts` now protects `/profile/*` too and redirects unauthenticated users to `/sign-in`. Dashboard layout now uses the real session user instead of a hardcoded demo user.
- **2026-06-15** — Branding fix complete. Renamed remaining "DevStash" references to "DevClustr" in `src/app/layout.tsx` (page title), `src/app/page.tsx` (landing heading), `SignInForm.tsx`, `RegisterForm.tsx`, `CLAUDE.md`, and `context/project-overview.md`. Verified in browser (page title and sign-in card). `demo@devstash.io` seed data left unchanged.
- **2026-06-15** — Email verification on register complete. New credentials users must verify their email before signing in. Resend sends a 24-hour token link on registration. `/verify-email?token=...` validates the token and sets `emailVerified`; redirects to `/sign-in?verified=1` on success. `/check-email` post-registration landing page. `/resend-verification` page + API route for resending. Sign-in blocks unverified users with a specific error (`email_not_verified` code from NextAuth). Prisma schema: `emailVerificationToken` + `emailVerificationTokenExpiry` added to `User` with migration. `scripts/purge-non-demo-users.ts` (`npm run db:purge-users`) added to reset test data. GitHub OAuth users unaffected.
