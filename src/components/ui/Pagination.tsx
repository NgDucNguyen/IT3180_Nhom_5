import Link from "next/link";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildPageUrl(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Pagination — Phân trang chuẩn dựa trên URL query string (?page=...).
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Phân trang danh sách"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(basePath, currentPage - 1, searchParams)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          ← Trước
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400">
          ← Trước
        </span>
      )}

      {pages.map((page) => {
        const active = page === currentPage;
        return (
          <Link
            key={page}
            href={buildPageUrl(basePath, page, searchParams)}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(basePath, currentPage + 1, searchParams)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          Sau →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400">
          Sau →
        </span>
      )}
    </nav>
  );
}
