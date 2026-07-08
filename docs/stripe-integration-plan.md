# Stripe Subscription Integration Plan

**Product:** DevStash Pro — $8/mo (monthly) · $72/yr (annual, ~$6/mo)

---

## Current State

| Area | Status |
|------|--------|
| Stripe env vars (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, price IDs) | ✅ Configured in `.env` |
| User model (`isPro`, `stripeCustomerId`, `stripeSubscriptionId`) | ✅ In Prisma schema |
| `stripe` npm package | ❌ Not installed |
| Session exposes `isPro` | ❌ Not in JWT/session callbacks |
| Tier enforcement (item/collection limits) | ❌ No checks exist |
| File upload pro check | ❌ No check in `/api/upload` |
| Billing UI (`/settings/billing`) | ❌ Does not exist |
| Stripe webhook route | ❌ Does not exist |

---

## Implementation Order

1. Install `stripe` SDK + update env vars
2. Extend session types + JWT callback (always sync `isPro` from DB)
3. Create Stripe client singleton
4. Create webhook route (`/api/webhooks/stripe`)
5. Create checkout session route (`/api/stripe/checkout`)
6. Create billing portal route (`/api/stripe/portal`)
7. Add tier limit constants
8. Add tier checks to item/collection creation and file upload
9. Build `/settings/billing` page
10. Wire upgrade CTAs (upload guard, limit guards)

---

## 1. Install Dependency

```bash
npm install stripe
```

No `@stripe/react-stripe-js` needed — using Stripe-hosted Checkout (redirect), not the embedded form.

---

## 2. Environment Variables

### Update `.env` and `.env.example`

Current `.env` has `STRIPE_PUBLISHABLE_KEY` (server-only name). For client-side access, rename:

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."   # was STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET="whsec_..."                   # fill in after dashboard setup
STRIPE_PRICE_ID_MONTHLY="price_1ToAdfQaAmTkaIUe1m2JNGLo"
STRIPE_PRICE_ID_YEARLY="price_1ToB2RQaAmTkaIUe3eSarVnX"
```

---

## 3. Files to Modify

### `src/types/next-auth.d.ts`

Add `isPro` to the session user type:

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

---

### `src/auth.ts`

Modify the JWT and session callbacks. Per the research note, use the "always sync from DB" approach rather than `trigger === "update"`, so a Stripe webhook update is reflected on the next page load without any client-side `update()` call.

**Current session callback (lines 24–29):**
```typescript
session({ session, token }) {
  if (token.sub && session.user) {
    session.user.id = token.sub;
  }
  return session;
},
```

**Replace both callbacks with:**
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

Add `import { prisma } from "@/lib/prisma";` to the top of `auth.ts` if not already present.

---

### `src/lib/constants.ts`

Add free tier limits:

```typescript
export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

---

### `src/app/api/upload/route.ts`

Add a pro check before the existing file type/size validation:

```typescript
// After auth check, before file validation:
const session = await auth();
const userId = session?.user?.id;
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

if (!session.user.isPro) {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription." },
    { status: 403 }
  );
}
```

---

### `src/app/settings/page.tsx`

Add a billing link card below the existing sections:

```tsx
import Link from "next/link";

// Inside the returned JSX, after the account section:
<div className="rounded-lg border p-6">
  <h2 className="text-lg font-medium mb-1">Subscription</h2>
  <p className="text-sm text-muted-foreground mb-4">
    {user.isPro ? "You are on the Pro plan." : "You are on the Free plan."}
  </p>
  <Link
    href="/settings/billing"
    className="inline-flex items-center text-sm font-medium underline underline-offset-4"
  >
    Manage billing →
  </Link>
</div>
```

Note: `user` from `getProfileUser` needs to include `isPro` — verify `src/lib/db/users.ts` selects it, or add it to the select.

---

## 4. Files to Create

### `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30",
  typescript: true,
});
```

---

### `src/app/api/webhooks/stripe/route.ts`

This is the most critical route. It listens for subscription lifecycle events and updates the DB.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      await prisma.user.update({
        where: { email: session.customer_email! },
        data: {
          isPro: true,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          isPro: false,
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const isActive = sub.status === "active" || sub.status === "trialing";
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { isPro: isActive },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.user.updateMany({
        where: { stripeCustomerId: invoice.customer as string },
        data: { isPro: false },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

**Important:** Do NOT wrap this route with NextAuth's `auth()` — Stripe webhooks have no session. Skip body parsing middleware too (Next.js raw body is available via `req.text()`).

---

### `src/app/api/stripe/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const CheckoutSchema = z.object({
  priceId: z.string().startsWith("price_"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const { priceId } = parsed.data;
  const allowedPriceIds = [
    process.env.STRIPE_PRICE_ID_MONTHLY!,
    process.env.STRIPE_PRICE_ID_YEARLY!,
  ];
  if (!allowedPriceIds.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
    metadata: { userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

### `src/app/api/stripe/portal/route.ts`

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

---

### `src/lib/tier.ts`

Reusable helpers for checking tier limits in routes and server actions:

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

Use these in item/collection creation routes:

```typescript
// In item creation route/action:
const allowed = await canCreateItem(userId, session.user.isPro);
if (!allowed) {
  return NextResponse.json(
    { error: `Free plan is limited to ${FREE_TIER_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` },
    { status: 402 }
  );
}
```

---

### `src/app/settings/billing/page.tsx`

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BillingActions } from "@/components/billing/billing-actions";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeSubscriptionId: true },
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Billing</h1>

        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-medium">{user?.isPro ? "Pro" : "Free"}</p>
          </div>

          <BillingActions isPro={user?.isPro ?? false} />
        </div>
      </div>
    </div>
  );
}
```

---

### `src/components/billing/billing-actions.tsx`

Client component that handles checkout and portal redirects:

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

interface BillingActionsProps {
  isPro: boolean;
}

export function BillingActions({ isPro }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <button
        onClick={handlePortal}
        disabled={loading}
        className="rounded-md bg-secondary px-4 py-2 text-sm font-medium"
      >
        {loading ? "Loading..." : "Manage subscription"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!)}
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {loading ? "Loading..." : "Upgrade — $8/month"}
      </button>
      <button
        onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!)}
        disabled={loading}
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        {loading ? "Loading..." : "Upgrade — $72/year (save 25%)"}
      </button>
    </div>
  );
}
```

**Note:** Since price IDs are non-secret, expose them as `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` / `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` in `.env`, or pass them as props from the server component instead (safer approach).

**Safer alternative** — pass price IDs as props from the server page:

```tsx
// In billing/page.tsx, pass them down:
<BillingActions
  isPro={user?.isPro ?? false}
  monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
  yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
/>
```

This avoids exposing them via `NEXT_PUBLIC_` at all.

---

## 5. Stripe Dashboard Setup

1. **Create Product**
   - Name: `DevStash Pro`
   - Description: `Unlimited items, collections, file uploads, AI features, and export.`

2. **Create Prices** (or verify existing price IDs match)
   - Monthly: $8.00 USD / month → copy Price ID → `STRIPE_PRICE_ID_MONTHLY`
   - Annual: $72.00 USD / year → copy Price ID → `STRIPE_PRICE_ID_YEARLY`

3. **Enable Customer Portal**
   - Go to Stripe Dashboard → Settings → Customer Portal
   - Enable: Cancel subscriptions, Update payment method
   - Set return URL: `https://yourapp.com/settings/billing`

4. **Create Webhook Endpoint**
   - URL: `https://yourapp.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.paused`
     - `invoice.payment_failed`
   - Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

5. **Local testing with Stripe CLI**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # Copy the webhook secret printed by CLI → use as STRIPE_WEBHOOK_SECRET for local dev
   ```

---

## 6. Testing Checklist

### Setup
- [ ] `npm install stripe` succeeds
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Stripe CLI installed and logged in

### Session / Auth
- [ ] `session.user.isPro` is `false` for a new user
- [ ] After manually setting `isPro = true` in DB, page reload shows pro status (validates JWT sync)

### Checkout Flow
- [ ] Clicking "Upgrade — $8/month" redirects to Stripe Checkout
- [ ] Clicking "Upgrade — $72/year" redirects to Stripe Checkout  
- [ ] Completing checkout redirects to `/settings/billing?success=true`
- [ ] Webhook fires `checkout.session.completed` event
- [ ] DB updated: `isPro = true`, `stripeCustomerId`, `stripeSubscriptionId` set
- [ ] After page reload, billing page shows "Pro" plan

### Tier Enforcement
- [ ] Free user creating 51st item gets `402` error with upgrade message
- [ ] Free user creating 4th collection gets `402` error with upgrade message
- [ ] Free user uploading a file gets `403` error
- [ ] Pro user can create items/collections without limit
- [ ] Pro user can upload files

### Cancellation
- [ ] "Manage subscription" opens Stripe Customer Portal
- [ ] Cancelling subscription fires `customer.subscription.deleted` webhook
- [ ] DB updated: `isPro = false`
- [ ] After reload, user back on Free plan

### Edge Cases
- [ ] `invoice.payment_failed` sets `isPro = false`
- [ ] Webhook with invalid signature returns `400`
- [ ] Non-existent user in webhook payload doesn't crash (handle gracefully)

---

## 7. Notes & Decisions

### Why "always sync isPro from DB" in JWT callback

Stripe webhooks update the database directly, not the session. If the JWT callback only synced `isPro` when `trigger === "update"`, the session would stay stale until the user explicitly called `update()`. By always reading `isPro` from the DB on every JWT validation, a simple page reload after checkout completion is sufficient. The cost is one extra DB read per session token validation — acceptable given Neon's connection pooling.

### Webhook event — `checkout.session.completed` uses `customer_email`

The checkout session is created with `customer_email: session.user.email`. The webhook handler looks up the user by email. This works for credential users. For OAuth users (GitHub), the email is set by the provider and stored on the User model.

Alternative: use `metadata: { userId }` in the checkout session (already included) as the lookup key — more robust:
```typescript
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  if (!userId) break;
  await prisma.user.update({
    where: { id: userId },
    data: { isPro: true, ... }
  });
}
```

**Recommendation:** Use `metadata.userId` as the primary lookup (already in the checkout route above), not `customer_email`, for robustness.

### Free tier checks — where to add them

Item creation and collection creation are currently handled by DB helper functions in `src/lib/db/items.ts` and `src/lib/db/collections.ts`. The check should go in the **API route or server action that calls these helpers**, not inside the helpers themselves (helpers don't have session access by design).

### Development mode

Per `project-overview.md`: "During development, all users have full access regardless of plan." Consider wrapping tier checks with a dev bypass:
```typescript
const isPro = process.env.NODE_ENV === "development" ? true : session.user.isPro;
```
Remove this before shipping.
