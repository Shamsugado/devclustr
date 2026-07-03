import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Crown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BillingActions from "@/components/billing/billing-actions";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { success } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeSubscriptionId: true },
  });

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <CreditCard className="size-5.5" />
          Billing
        </h1>

        {success === "true" && (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-400 flex items-center justify-between gap-4">
            <span>You&apos;re now on the Pro plan!</span>
            <Link href="/settings" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Back to Settings
            </Link>
          </div>
        )}

        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Current plan</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {user.isPro ? "Pro" : "Free"}
              </p>
              {user.isPro ? (
                <Badge className="gap-1 border-transparent bg-linear-to-r from-amber-400 to-amber-600 text-amber-950">
                  <Crown className="size-3" />
                  Pro
                </Badge>
              ) : (
                <Badge variant="secondary">Free</Badge>
              )}
            </div>
          </div>
          <BillingActions
            isPro={user.isPro}
            monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
            yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
          />
        </div>
      </div>
    </div>
  );
}
