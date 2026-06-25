import Link from "next/link";
import { pageNumbers } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) => `${basePath}?page=${p}`;
  const pages = pageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Pagination">
      <PrevNext href={href(page - 1)} disabled={page <= 1} label="← Prev" />

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={
              p === page
                ? "px-3 py-1.5 rounded text-sm bg-primary text-primary-foreground"
                : "px-3 py-1.5 rounded text-sm text-muted-foreground hover:bg-muted transition-colors"
            }
          >
            {p}
          </Link>
        )
      )}

      <PrevNext href={href(page + 1)} disabled={page >= totalPages} label="Next →" />
    </nav>
  );
}

function PrevNext({ href, disabled, label }: { href: string; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 rounded text-sm text-muted-foreground/40 cursor-not-allowed select-none">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:bg-muted transition-colors"
    >
      {label}
    </Link>
  );
}
