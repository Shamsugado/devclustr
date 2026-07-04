import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProfileUser } from "@/lib/db/users";
import UpgradePricing from "@/components/upgrade/UpgradePricing";

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/upgrade");

  const user = await getProfileUser(session.user.id);
  if (!user) redirect("/sign-in");
  if (user.isPro) redirect("/settings/billing");

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Upgrade to Pro</h1>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited items, collections, file & image uploads, and AI features.
          </p>
        </div>

        <UpgradePricing
          monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
          yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
        />
      </div>
    </div>
  );
}
