import { Lock } from "lucide-react";
import BillingActions from "@/components/billing/billing-actions";

export default function UpgradePrompt({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{label} is a Pro feature</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Upgrade to Pro to store and organize {label.toLowerCase()} in DevClustr.
        </p>
      </div>
      <BillingActions
        isPro={false}
        monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
        yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
      />
    </div>
  );
}
