import Link from "next/link";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * ErrorState — Trạng thái hiển thị lỗi thống nhất toàn hệ thống (dùng cho error.tsx hoặc khi API trả lỗi).
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function ErrorState({
  title = "Đã xảy ra sự cố khi tải dữ liệu",
  message = "Hệ thống không thể hoàn tất yêu cầu ngay lúc này. Vui lòng thử lại hoặc quay về trang khám phá.",
  onRetry,
  retryLabel = "Thử lại ngay",
  backHref = "/listings",
  backLabel = "Về trang Khám phá",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 px-6 py-12 text-center ${className}`.trim()}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
        ⚠️
      </div>
      <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-600">
        {message}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button variant="danger" size="md" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
