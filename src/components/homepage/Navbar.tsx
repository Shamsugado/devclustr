"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#252838] bg-[#0c0e16]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white">
              <FolderOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-white">DevClustr</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">
              Features
            </a>
            <a href="#pricing" className="text-sm text-slate-400 transition-colors hover:text-white">
              Pricing
            </a>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/sign-in"
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-h-[44px] min-w-[44px] md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block h-0.5 w-5 bg-slate-300 transition-transform duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-slate-300 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-slate-300 transition-transform duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#252838] bg-[#0c0e16] px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#13151f] hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#13151f] hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="mt-2 flex flex-col gap-2 border-t border-[#252838] pt-2">
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#13151f] hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-500"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
