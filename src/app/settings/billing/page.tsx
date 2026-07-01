import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillingActions from "@/components/billing/billing-actions";

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
        <h1 className="text-2xl font-semibold">Billing</h1>

        {success === "true" && (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-400">
            You&apos;re now on the Pro plan!
          </div>
        )}

        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">Current plan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user.isPro ? "Pro" : "Free"}
            </p>
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
