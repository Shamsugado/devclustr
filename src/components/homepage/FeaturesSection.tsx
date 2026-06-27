const FEATURES = [
  {
    color: "#3b82f6",
    title: "Code Snippets",
    description: "Save reusable code with Monaco syntax highlighting. Tag by language, framework, or topic.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    color: "#f59e0b",
    title: "AI Prompts",
    description: "Build your personal prompt library for ChatGPT, Claude, and other AI tools. Never rewrite a prompt again.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    color: "#8b5cf6",
    title: "Instant Search",
    description: "Find anything in milliseconds with full-text search and a keyboard-first command palette.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    color: "#06b6d4",
    title: "CLI Commands",
    description: "Never forget a complex command again. Save flags, aliases, and one-liners with descriptions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    color: "#64748b",
    title: "Files & Docs",
    description: "Upload reference docs, architecture diagrams, PDFs, and images. Always at your fingertips.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    color: "#22c55e",
    title: "Collections",
    description: "Group related items into collections. Organize by project, technology, or team. Pin your favorites.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#0c0e16] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Everything a developer needs
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            One place for every type of knowledge you create
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-[#252838] bg-[#13151f] p-6 transition-all duration-200 hover:-translate-y-1"
              style={{ ["--accent" as string]: f.color }}
            >
              <div
                className="mb-4 inline-flex rounded-lg p-2"
                style={{ background: `${f.color}20`, color: f.color }}
              >
                {f.icon}
              </div>
              <div
                className="mb-3 h-0.5 w-10 rounded-full"
                style={{ background: f.color }}
              />
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
