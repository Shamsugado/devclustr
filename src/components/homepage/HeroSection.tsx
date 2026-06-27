import Link from "next/link";
import HeroDashboardVisual from "./HeroDashboardVisual";
import HeroChaosCanvasLoader from "./HeroChaosCanvasLoader";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0c0e16] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Text */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Stop Losing Your{" "}
            <span className="bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Your snippets are in VS Code, your prompts are in Notion, your commands are scattered
            across notes apps. DevClustr brings it all together in one searchable, organized hub.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="text-base font-medium text-slate-300 transition-colors hover:text-white"
            >
              See Features →
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="mt-16 flex flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center">
          {/* Chaos box */}
          <div className="w-full max-w-xs rounded-xl border border-[#252838] bg-[#13151f] md:w-72">
            <div className="border-b border-[#252838] px-4 py-2 text-xs text-slate-500">
              Your knowledge today...
            </div>
            <div className="h-56">
              <HeroChaosCanvasLoader />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center md:flex-col">
            <svg
              className="h-8 w-16 rotate-0 text-indigo-500 md:h-16 md:w-8 md:rotate-90"
              viewBox="0 0 60 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="arrowGrad" x1="0" y1="14" x2="60" y2="14" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path d="M2 14 H52" stroke="url(#arrowGrad)" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M42 4 L56 14 L42 24"
                stroke="url(#arrowGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Dashboard box */}
          <div className="w-full max-w-xs rounded-xl border border-[#252838] bg-[#13151f] md:w-72">
            <div className="border-b border-[#252838] px-4 py-2 text-xs text-slate-500">
              ...with DevClustr
            </div>
            <div className="h-56 p-2">
              <HeroDashboardVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
