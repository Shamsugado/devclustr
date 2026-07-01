# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe SDK and wire up the foundational pieces needed before any payment flows can work: the Stripe client singleton, session type extensions with `isPro`, JWT/session callbacks that always sync from DB, tier limit constants, and the `canCreateItem` / `canCreateCollection` helpers with full unit test coverage.

No UI, no webhook, no checkout in this phase.

## Goals

- Install `stripe` npm package
- Create `src/lib/stripe.ts` singleton
- Extend `Session` and `JWT` types with `isPro`
- Update auth callbacks to always sync `isPro` from DB on every JWT validation
- Add free-tier limit constants to `src/lib/constants.ts`
- Create `src/lib/tier.ts` with `canCreateItem` and `canCreateCollection` helpers
- Write unit tests for the tier helpers

## Requirements

### 1. Install Dependency

```bash
npm install stripe
```

No `@stripe/react-stripe-js` — using Stripe-hosted Checkout redirect, not embedded form.

### 2. Environment Variables

Update `.env` and `.env.example`:

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_1ToAdfQaAmTkaIUe1m2JNGLo"
STRIPE_PRICE_ID_YEARLY="price_1ToB2RQaAmTkaIUe3eSarVnX"
```

Rename `STRIPE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if it exists.

### 3. Stripe Client Singleton

**File:** `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30",
  typescript: true,
});
```

### 4. Type Extensions

**File:** `src/types/next-auth.d.ts`

Add `isPro` to `Session.user` and `JWT`:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
```

### 5. Auth Callbacks

**File:** `src/auth.ts`

Replace the existing `session` callback with both a `jwt` and updated `session` callback. Add `import { prisma } from "@/lib/prisma"` if not already present.

```typescript
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
  }
  // Always sync isPro from DB — catches webhook updates without client trigger
  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true },
    });
    token.isPro = dbUser?.isPro ?? false;
  }
  return token;
},

session({ session, token }) {
  if (token.sub && session.user) {
    session.user.id = token.sub;
    session.user.isPro = token.isPro ?? false;
  }
  return session;
},
```

**Why always-sync:** Stripe webhooks update the DB directly. If `isPro` only synced on `trigger === "update"`, the session would stay stale until the user called `update()` client-side. Always reading from DB means a simple page reload is sufficient. Cost: one extra `SELECT` per JWT validation — acceptable with Neon's connection pooling.

### 6. Tier Limit Constants

**File:** `src/lib/constants.ts`

Append (do not change existing constants):

```typescript
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### 7. Tier Helpers

**File:** `src/lib/tier.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";

export async function canCreateItem(userId: string, isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const count = await prisma.item.count({ where: { userId } });
  return count < FREE_TIER_ITEM_LIMIT;
}

export async function canCreateCollection(userId: string, isPro: boolean): Promise<boolean> {
  if (isPro) return true;
  const count = await prisma.collection.count({ where: { userId } });
  return count < FREE_TIER_COLLECTION_LIMIT;
}
```

These helpers belong in routes/server actions — not inside DB helpers (which have no session access by design).

## Unit Tests

**File:** `src/lib/__tests__/tier.test.ts`

Test cases for `canCreateItem`:
- Pro user always returns `true` without querying the DB
- Free user below limit returns `true`
- Free user at exactly the limit returns `false`
- Free user above the limit returns `false`

Test cases for `canCreateCollection`:
- Pro user always returns `true` without querying the DB
- Free user below limit (0, 1, 2 items) returns `true`
- Free user at limit (3) returns `false`

Mock `prisma.item.count` and `prisma.collection.count`. Verify the DB is never called when `isPro` is `true`.

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe singleton |
| `src/lib/tier.ts` | `canCreateItem`, `canCreateCollection` helpers |
| `src/lib/__tests__/tier.test.ts` | Unit tests |

## Files to Modify

| File | Change |
|------|--------|
| `src/types/next-auth.d.ts` | Add `isPro` to `Session.user` and `JWT` |
| `src/auth.ts` | Add `jwt` callback; update `session` callback |
| `src/lib/constants.ts` | Add `FREE_TIER_ITEM_LIMIT`, `FREE_TIER_COLLECTION_LIMIT` |
| `.env` | Add/rename Stripe env vars |
| `.env.example` | Mirror `.env` additions |

## Testing Checklist

- [ ] `npm install stripe` succeeds
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm test` — all tier helper tests pass
- [ ] `session.user.isPro` is `false` for a new user (check via `console.log` in a server component)
- [ ] After manually setting `isPro = true` in Neon dev DB, a page reload reflects pro status (validates JWT sync)
