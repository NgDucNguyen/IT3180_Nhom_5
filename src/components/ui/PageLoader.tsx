export interface PageLoaderProps {
  label?: string;
  cardCount?: number;
  className?: string;
}

/**
 * PageLoader — Khung tải trang (Skeleton & Spinner) chuẩn hoá cho mọi màn hình.
 * Có thể dùng trực tiếp trong file `loading.tsx` của Next.js App Router.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function PageLoader({
  label = "Đang tải dữ liệu thiết bị điện tử...",
  cardCount = 6,
  className = "",
}: PageLoaderProps) {
  const skeletons = Array.from({ length: cardCount }, (_, idx) => idx);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full space-y-6 py-6 ${className}`.trim()}
    >
      {/* Thanh tiêu đề đang tải */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xs">
        <span
          aria-hidden
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
        />
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>

      {/* Lưới Skeleton thẻ sản phẩm */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
          >
            <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-slate-200/80" />
            <div className="mt-4 space-y-2.5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-2/5 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
                <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
