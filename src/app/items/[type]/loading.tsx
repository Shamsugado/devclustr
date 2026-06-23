export default function Loading() {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-28 bg-muted rounded animate-pulse" />
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border border-l-4 border-l-muted rounded-lg p-4 space-y-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-muted" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
            <div className="h-16 bg-muted rounded" />
            <div className="flex gap-1">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-10 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
