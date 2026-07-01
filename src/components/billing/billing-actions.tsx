"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BillingActionsProps {
  isPro: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export default function BillingActions({ isPro, monthlyPriceId, yearlyPriceId }: BillingActionsProps) {
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

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Failed to open billing portal");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <Button onClick={handlePortal} disabled={loading}>
        {loading ? "Loading..." : "Manage subscription"}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => handleCheckout(monthlyPriceId)} disabled={loading}>
        {loading ? "Loading..." : "Upgrade — $8/month"}
      </Button>
      <Button variant="outline" onClick={() => handleCheckout(yearlyPriceId)} disabled={loading}>
        {loading ? "Loading..." : "Upgrade — $72/year (save 25%)"}
      </Button>
    </div>
  );
}
