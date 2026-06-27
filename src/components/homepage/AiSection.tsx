const CHECKLIST = [
  {
    title: "Auto-generate tags",
    desc: "AI analyzes your content and suggests relevant tags automatically.",
  },
  {
    title: "Semantic search",
    desc: "Search by meaning, not just keywords. Find what you meant to save.",
  },
  {
    title: "Content summaries",
    desc: "Get instant AI summaries of long files, documents, and notes.",
  },
  {
    title: "Related suggestions",
    desc: "Discover hidden connections between items across your library.",
  },
];

export default function AiSection() {
  return (
    <section className="bg-[#13151f] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Text side */}
          <div className="flex-1">
            <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
              Pro Feature
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              AI-Powered Organization
            </h2>
            <p className="mt-3 text-lg text-slate-400">
              Let AI do the heavy lifting. Tag, search, and discover your knowledge automatically.
            </p>
            <ul className="mt-8 flex flex-col gap-5">
              {CHECKLIST.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Editor mock */}
          <div className="flex-1">
            <div className="overflow-hidden rounded-xl border border-[#252838] bg-[#1e1e1e]">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-[#252838] px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-slate-500">fetchUser.js</span>
              </div>

              {/* Code body */}
              <div className="flex gap-4 px-4 py-4 font-mono text-sm">
                <div className="flex flex-col gap-1 text-right text-slate-600 select-none">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="leading-6">{n}</span>
                  ))}
                </div>
                <div className="flex flex-col gap-1 overflow-x-auto">
                  <div className="leading-6 whitespace-nowrap">
                    <span className="text-[#569cd6]">const </span>
                    <span className="text-[#dcdcaa]">fetchUser</span>
                    <span className="text-slate-300"> = </span>
                    <span className="text-[#569cd6]">async </span>
                    <span className="text-slate-300">(id) ={">"} {"{"}</span>
                  </div>
                  <div className="leading-6 whitespace-nowrap pl-4">
                    <span className="text-[#569cd6]">const </span>
                    <span className="text-slate-300">res = </span>
                    <span className="text-[#569cd6]">await </span>
                    <span className="text-[#dcdcaa]">fetch</span>
                    <span className="text-slate-300">(</span>
                    <span className="text-[#ce9178]">{"`/api/users/${id}`"}</span>
                    <span className="text-slate-300">);</span>
                  </div>
                  <div className="leading-6 whitespace-nowrap pl-4">
                    <span className="text-[#569cd6]">if </span>
                    <span className="text-slate-300">(!res.ok) </span>
                    <span className="text-[#569cd6]">throw new </span>
                    <span className="text-[#dcdcaa]">Error</span>
                    <span className="text-slate-300">(</span>
                    <span className="text-[#ce9178]">&apos;Not found&apos;</span>
                    <span className="text-slate-300">);</span>
                  </div>
                  <div className="leading-6 whitespace-nowrap pl-4">
                    <span className="text-[#569cd6]">return </span>
                    <span className="text-slate-300">res.</span>
                    <span className="text-[#dcdcaa]">json</span>
                    <span className="text-slate-300">();</span>
                  </div>
                  <div className="leading-6 whitespace-nowrap">
                    <span className="text-slate-300">{"}"}</span>
                    <span className="text-slate-300">;</span>
                  </div>
                </div>
              </div>

              {/* AI tags panel */}
              <div className="border-t border-[#252838] px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-purple-400">
                  <span>✦</span>
                  <span>AI Generated Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["fetch", "async/await", "API", "error-handling", "javascript"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#252838] bg-[#13151f] px-2 py-0.5 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
