"use client";

import { useState } from "react";
import Link from "next/link";

const FREE_FEATURES = [
  { yes: true, label: "Up to 50 items" },
  { yes: true, label: "3 collections" },
  { yes: true, label: "Code snippets & prompts" },
  { yes: true, label: "Basic search" },
  { yes: false, label: "AI features" },
  { yes: false, label: "File & image storage" },
];

const PRO_FEATURES = [
  { label: "Unlimited items" },
  { label: "Unlimited collections" },
  { label: "All item types" },
  { label: "AI-powered tagging & search" },
  { label: "File & image storage (10 GB)" },
  { label: "Priority support" },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-[#0c0e16] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-lg text-slate-400">Start free. Upgrade when you need more.</p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm transition-colors ${!yearly ? "text-white" : "text-slate-500"}`}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly((y) => !y)}
              className="relative h-6 w-11 rounded-full border border-[#252838] bg-[#13151f] transition-colors focus:outline-none"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-blue-600 transition-transform duration-200 ${yearly ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
            <span className={`flex items-center gap-2 text-sm transition-colors ${yearly ? "text-white" : "text-slate-500"}`}>
              Yearly
              {yearly && (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Save 25%
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Free card */}
          <div className="rounded-xl border border-[#252838] bg-[#13151f] p-6">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400">Free</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="mb-1 text-sm text-slate-500">/mo</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Perfect for getting started</p>
            </div>
            <ul className="mb-6 flex flex-col gap-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  <span className={f.yes ? "text-green-400" : "text-slate-600"}>
                    {f.yes ? "✓" : "✗"}
                  </span>
                  <span className={f.yes ? "text-slate-300" : "text-slate-600"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-lg border border-[#252838] py-2.5 text-center text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro card */}
          <div className="relative rounded-xl border border-blue-500/50 bg-[#13151f] p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-400">Pro</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">
                  {yearly ? "$6" : "$8"}
                </span>
                <span className="mb-1 text-sm text-slate-500">/mo</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {yearly ? "Billed annually — save $24" : "Billed monthly"}
              </p>
            </div>
            <ul className="mb-6 flex flex-col gap-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">{f.label}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Start Pro Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
