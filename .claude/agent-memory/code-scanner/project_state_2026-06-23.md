---
name: project-state-2026-06-23
description: DevClustr full audit snapshot — confirmed patterns, key false-positive guards, and structural notes
metadata:
  type: project
---

Full code audit performed 2026-06-23.

**Key confirmed patterns (do not re-flag):**
- `.gitignore` contains `.env*` — confirmed, not an issue
- React Compiler is enabled — no manual useMemo/useCallback needed
- `deleteItem` DB helper is called before `deleteItemInDb` to get file key before deletion — intentional two-step
- Download route at `/api/items/[id]/download` is auth-gated (session check + `getItemById` scopes to userId)
- `getSystemItemTypes` uses React `cache()` for deduplication across layout/page
- Dashboard page still uses hardcoded demo user (`demo@devstash.io`) — intentional dev shortcut, NOT a session auth gap for that specific page
- `formatBytes` is duplicated in `ItemDrawer.tsx`, `FileUpload.tsx`, and `FileRow.tsx` — real medium-severity code quality issue

**Real issues found (2026-06-23 audit):**
- CRITICAL: `/dashboard/page.tsx` still hardcodes `demo@devstash.io` instead of using real session — all authenticated users see the SAME demo user's data
- HIGH: `deleteItem` action — if R2 deletion fails, the error is swallowed silently (item deleted from DB but file orphaned in R2)
- HIGH: `/api/upload` — MIME type validated from `file.type` (client-controlled), not magic bytes; can be spoofed
- HIGH: `ContentDisposition` header echoed verbatim from R2 onto download response — stored value was set by the upload route (controlled), but if it ever came from elsewhere it would be a header injection vector; low immediate risk
- HIGH: `resend-verification` route checks rate limit AFTER parsing body — IP extracted from already-parsed request; rate limit key includes email (good) but the order means body is always parsed even if you could be rate-limited
- MEDIUM: `formatBytes` duplicated in three files
- MEDIUM: `ItemDrawer.tsx` is 603 lines — handles view, edit, action bar, skeleton, file display — should be split. Suggested: extract `ItemDrawerContent` + `ItemDrawerEditContent` into separate files, extract `ActionBar`/`EditBar`/`DrawerSkeleton` into `ItemDrawerParts.tsx`, extract `formatBytes`/`initEditForm` into `src/lib/format.ts`
- MEDIUM: `DashboardMain.tsx` is 270 lines with 5 sub-components defined inline — could be split. Suggested: extract `StatsCards`, `CollectionCard`, `PinnedItemCard`, `RecentItemCard` into `src/components/dashboard/` files; move `formatRelativeTime` to `src/lib/format.ts`
- LOW: `Sidebar.tsx` is 280 lines — `SidebarContent`, `NavItem`, `CollectionItem` are defined inline and could be split, but the file is cohesive enough that splitting is optional
- LOW (decomp): `NewItemDialog.tsx` is 279 lines — contains inline form field rendering with type-branching logic; could extract a `useNewItemForm` hook, but the file is manageable at current size
- NOTE: `formatRelativeTime` is duplicated in `DashboardMain.tsx`, `ItemCard.tsx` — same pattern as `formatBytes` duplication. Both should be moved to a shared `src/lib/format.ts`
- MEDIUM: `getRecentCollections` fetches ALL user collections then sorts/slices in JS — N+1 risk for users with many collections
- MEDIUM: `getItemsByTypeSlug` de-pluralizes by naive `slice(0,-1)` — breaks for types ending in non-s (future-proofing concern)
- LOW: Registration endpoint returns 409 with "A user with this email already exists" — user enumeration leak (different from forgot-password which correctly returns 200 always)
- LOW: `file.name` used directly in `Content-Disposition` header without RFC 5987 encoding — filenames with quotes/non-ASCII could be malformed
- LOW: `ImageCard` and `FileRow` are not server components even though they have no interactivity (onClick passed as prop forces client boundary from parent)

**Why:** This is the first full security+quality audit of DevClustr. The demo-user dashboard bug is the most critical finding.
**How to apply:** In future audits, skip re-checking the above confirmed-safe patterns. Focus new code additions on these recurring risk areas: file handling, auth routes, and data scoping.
