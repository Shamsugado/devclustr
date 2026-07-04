"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FREE_FEATURES = [
  { yes: true, label: "Up to 50 items" },
  { yes: true, label: "3 collections" },
  { yes: true, label: "Code snippets & prompts" },
  { yes: true, label: "Basic search" },
  { yes: false, label: "AI features" },
  { yes: false, label: "File & image storage" },
];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "All item types",
  "AI-powered tagging & search",
  "File & image storage",
  "Priority support",
];

interface UpgradePricingProps {
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export default function UpgradePricing({ monthlyPriceId, yearlyPriceId }: UpgradePricingProps) {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: yearly ? yearlyPriceId : monthlyPriceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Failed to start checkout");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Monthly/Yearly toggle */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className={`text-sm transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((y) => !y)}
          className="relative h-6 w-11 rounded-full border border-input bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-transform duration-200 ${
              yearly ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`flex items-center gap-2 text-sm transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          {yearly && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-500">Save 25%</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Free card */}
        <div className="rounded-xl border p-6">
          <p className="text-sm font-medium text-muted-foreground">Free</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="mb-1 text-sm text-muted-foreground">/mo</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Your current plan</p>
          <ul className="my-6 flex flex-col gap-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-sm">
                <span className={f.yes ? "text-green-500" : "text-muted-foreground/40"}>
                  {f.yes ? "✓" : "✗"}
                </span>
                <span className={f.yes ? "" : "text-muted-foreground/60"}>{f.label}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border py-2.5 text-center text-sm font-medium text-muted-foreground">
            Current plan
          </div>
        </div>

        {/* Pro card */}
        <div className="relative rounded-xl border border-primary/50 p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Most Popular
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Pro</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold">{yearly ? "$6" : "$8"}</span>
            <span className="mb-1 text-sm text-muted-foreground">/mo</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {yearly ? "Billed annually at $72/year" : "Billed monthly"}
          </p>
          <ul className="my-6 flex flex-col gap-2.5">
            {PRO_FEATURES.map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <Button onClick={handleUpgrade} disabled={loading} className="w-full">
            {loading ? "Loading..." : `Upgrade — ${yearly ? "$72/year" : "$8/month"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
