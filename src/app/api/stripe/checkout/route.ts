import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";

const CheckoutSchema = z.object({
  priceId: z.string().startsWith("price_"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const allowedPriceIds = [
    process.env.STRIPE_PRICE_ID_MONTHLY,
    process.env.STRIPE_PRICE_ID_YEARLY,
  ];
  if (!allowedPriceIds.includes(parsed.data.priceId)) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const baseUrl = new URL(req.url).origin;
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email!,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${baseUrl}/settings/billing?success=true`,
    cancel_url: `${baseUrl}/settings/billing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
