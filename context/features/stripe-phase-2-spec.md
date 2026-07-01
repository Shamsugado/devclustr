# Stripe Integration — Phase 2: Webhooks, Feature Gating & Billing UI

## Overview

Build the complete payment layer on top of the Phase 1 infrastructure: webhook endpoint, checkout and billing portal API routes, tier enforcement on item/collection creation and file upload, and the `/settings/billing` page with upgrade CTAs.

**Prerequisite:** Phase 1 must be complete (`stripe` installed, `isPro` in session, tier helpers in place).

**Requires Stripe CLI** for local webhook testing — set it up before starting.

## Goals

- Webhook route that keeps `isPro` in sync with subscription lifecycle events
- Checkout session route that starts a Stripe-hosted upgrade flow
- Billing portal route for managing/cancelling an existing subscription
- Tier enforcement on item creation, collection creation, and file upload
- `/settings/billing` page (server component + `BillingActions` client component)
- Billing link card on `/settings`

## Requirements

### 1. Stripe CLI Setup (Local Testing)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET` in `.env` for local dev.

### 2. Webhook Route

**File:** `src/app/api/webhooks/stripe/route.ts`

- Do NOT wrap with `auth()` — Stripe has no session
- Read raw body with `req.text()` (not `.json()`)
- Verify signature with `stripe.webhooks.constructEvent`
- Return `400` for missing or invalid signature
- Use `metadata.userId` (not `customer_email`) as the primary lookup key in `checkout.session.completed`

Events to handle:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set `isPro = true`, store `stripeCustomerId` + `stripeSubscriptionId` via `metadata.userId` lookup |
| `customer.subscription.updated` | Set `isPro = active \| trialing`, leave false otherwise |
| `customer.subscription.deleted` | Set `isPro = false`, clear `stripeSubscriptionId` |
| `customer.subscription.paused` | Set `isPro = false`, clear `stripeSubscriptionId` |
| `invoice.payment_failed` | Set `isPro = false` |

Unhandled event types: do nothing, return `200`.

### 3. Checkout Route

**File:** `src/app/api/stripe/checkout/route.ts`

- Auth-guarded (`auth()` → 401 if no session)
- Accept `{ priceId }` in JSON body
- Validate with Zod: `z.string().startsWith("price_")`
- Server-side allowlist check against `STRIPE_PRICE_ID_MONTHLY` + `STRIPE_PRICE_ID_YEARLY`
- Create Stripe checkout session with:
  - `mode: "subscription"`
  - `customer_email: session.user.email`
  - `metadata: { userId }`
  - `success_url`: `/settings/billing?success=true`
  - `cancel_url`: `/settings/billing`
- Return `{ url }` — client redirects

### 4. Billing Portal Route

**File:** `src/app/api/stripe/portal/route.ts`

- Auth-guarded
- Look up `stripeCustomerId` for the user from DB
- Return `404` if none found (user has never subscribed)
- Create Stripe billing portal session with `return_url: /settings/billing`
- Return `{ url }` — client redirects

### 5. Tier Enforcement

Wire `canCreateItem` and `canCreateCollection` from `src/lib/tier.ts` into the creation routes/actions. Add the check **after** auth, **before** DB write.

**Item creation** (`src/actions/items.ts` → `createItem`):

```typescript
const allowed = await canCreateItem(userId, session.user.isPro);
if (!allowed) {
  return { success: false, error: `Free plan is limited to ${FREE_TIER_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` };
}
```

**Collection creation** (`src/actions/collections.ts` → `createCollection`):

```typescript
const allowed = await canCreateCollection(userId, session.user.isPro);
if (!allowed) {
  return { success: false, error: `Free plan is limited to ${FREE_TIER_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` };
}
```

**File upload** (`src/app/api/upload/route.ts`):

Add after auth check, before file validation:

```typescript
if (!session.user.isPro) {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription." },
    { status: 403 }
  );
}
```

### 6. Billing Page

**File:** `src/app/settings/billing/page.tsx`

Server component. Auth-guards with `redirect("/sign-in")`. Fetches `isPro` and `stripeSubscriptionId` from DB. Passes `isPro`, `monthlyPriceId`, and `yearlyPriceId` as props to `BillingActions` (price IDs passed as props — no `NEXT_PUBLIC_` exposure needed).

Layout:
- Heading: "Billing"
- Plan card: shows "Pro" or "Free" as current plan label
- `BillingActions` component for checkout / portal buttons
- If `?success=true` query param is present, show a success banner: "You're now on the Pro plan!"

**File:** `src/components/billing/billing-actions.tsx`

Client component (`"use client"`). Props: `{ isPro, monthlyPriceId, yearlyPriceId }`.

- Single `loading` state shared by all buttons
- `handleCheckout(priceId)` — POST `/api/stripe/checkout`, redirect to returned URL; `toast.error` on failure
- `handlePortal()` — POST `/api/stripe/portal`, redirect to returned URL; `toast.error` on failure
- If `isPro`: show "Manage subscription" button → `handlePortal`
- If free: show two buttons → "Upgrade — $8/month" (`monthlyPriceId`) and "Upgrade — $72/year (save 25%)" (`yearlyPriceId`)
- Buttons disabled while `loading`

### 7. Billing Link on Settings Page

**File:** `src/app/settings/page.tsx`

Add a "Subscription" card after the existing sections:

```tsx
<div className="rounded-lg border p-6">
  <h2 className="text-lg font-medium mb-1">Subscription</h2>
  <p className="text-sm text-muted-foreground mb-4">
    {user.isPro ? "You are on the Pro plan." : "You are on the Free plan."}
  </p>
  <Link href="/settings/billing" className="inline-flex items-center text-sm font-medium underline underline-offset-4">
    Manage billing →
  </Link>
</div>
```

Verify that `getProfileUser` (or equivalent) selects `isPro` — add it to the select if missing.

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/webhooks/stripe/route.ts` | Subscription lifecycle webhook |
| `src/app/api/stripe/checkout/route.ts` | Start Stripe Checkout session |
| `src/app/api/stripe/portal/route.ts` | Open Stripe Customer Portal |
| `src/app/settings/billing/page.tsx` | Billing server page |
| `src/components/billing/billing-actions.tsx` | Checkout / portal client component |

## Files to Modify

| File | Change |
|------|--------|
| `src/actions/items.ts` | Add `canCreateItem` check in `createItem` |
| `src/actions/collections.ts` | Add `canCreateCollection` check in `createCollection` |
| `src/app/api/upload/route.ts` | Add `isPro` guard before file validation |
| `src/app/settings/page.tsx` | Add subscription card with billing link |
| `src/lib/db/users.ts` | Add `isPro` to select if not present |

## Stripe Dashboard Setup

Before testing end-to-end, verify these are configured in the Stripe dashboard:

1. **Product:** `DevStash Pro`
2. **Prices:** Monthly $8/mo and Annual $72/yr — IDs must match `.env`
3. **Customer Portal:** Enable cancel + update payment; set return URL to `/settings/billing`
4. **Webhook Endpoint:** URL `/api/webhooks/stripe`, events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `invoice.payment_failed`

## Testing Checklist

### Setup
- [ ] Stripe CLI running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] `STRIPE_WEBHOOK_SECRET` set to CLI-printed secret in `.env`

### Checkout Flow
- [ ] Clicking "Upgrade — $8/month" redirects to Stripe Checkout
- [ ] Clicking "Upgrade — $72/year" redirects to Stripe Checkout
- [ ] Completing test checkout redirects to `/settings/billing?success=true`
- [ ] Success banner visible on billing page
- [ ] Webhook fires and DB updated: `isPro = true`, `stripeCustomerId`, `stripeSubscriptionId` set
- [ ] Page reload shows "Pro" plan

### Tier Enforcement
- [ ] Free user hitting item limit (50+) gets error message with upgrade hint
- [ ] Free user hitting collection limit (3+) gets error message with upgrade hint
- [ ] Free user uploading a file gets 403 with "Pro subscription required" message
- [ ] Pro user can create items/collections without limit
- [ ] Pro user can upload files

### Cancellation
- [ ] "Manage subscription" opens Stripe Customer Portal
- [ ] Cancelling subscription fires `customer.subscription.deleted` webhook
- [ ] DB updated: `isPro = false`, `stripeSubscriptionId = null`
- [ ] Page reload shows "Free" plan

### Edge Cases
- [ ] `invoice.payment_failed` sets `isPro = false`
- [ ] Webhook with invalid signature returns `400`
- [ ] Portal route returns `404` for user with no `stripeCustomerId`
- [ ] `npm run build` passes with no TypeScript errors
