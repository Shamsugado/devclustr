const NAV_ITEMS = [
  { color: "#3b82f6", label: "Snippets" },
  { color: "#f59e0b", label: "Prompts" },
  { color: "#06b6d4", label: "Commands" },
  { color: "#22c55e", label: "Notes" },
  { color: "#64748b", label: "Collections" },
  { color: "#ec4899", label: "Files" },
];

const CARD_COLORS = ["#3b82f6", "#f59e0b", "#06b6d4", "#22c55e", "#ec4899", "#6366f1"];

export default function HeroDashboardVisual() {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-lg border border-[#252838] bg-[#0c0e16]">
      {/* Mini sidebar */}
      <div className="flex w-12 flex-col items-center gap-2 border-r border-[#252838] bg-[#0a0c14] px-1 py-3">
        <div className="mb-2 flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-[8px] font-bold text-white">
          DC
        </div>
        <div className="h-1.5 w-6 rounded-full bg-[#252838]" />
        <div className="h-1.5 w-6 rounded-full bg-[#252838]" />
        {NAV_ITEMS.map((item) => (
          <div key={item.label} className="flex w-full items-center gap-1 rounded px-1 py-0.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="truncate text-[7px] text-slate-500">{item.label}</span>
          </div>
        ))}
        <div className="mt-auto h-4 w-4 rounded-full bg-[#252838]" />
      </div>

      {/* Mini main */}
      <div className="flex flex-1 flex-col overflow-hidden p-2">
        {/* Topbar */}
        <div className="mb-2 h-4 w-full rounded bg-[#13151f]" />
        {/* Section label */}
        <div className="mb-1.5 h-2 w-16 rounded bg-[#252838]" />
        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {CARD_COLORS.map((color) => (
            <div
              key={color}
              className="flex flex-col gap-1 rounded border-l-2 bg-[#13151f] p-1.5"
              style={{ borderLeftColor: color }}
            >
              <div className="h-1.5 w-full rounded bg-[#252838]" />
              <div className="h-1.5 w-2/3 rounded bg-[#252838]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
