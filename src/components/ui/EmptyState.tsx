import Link from "next/link";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}

/**
 * EmptyState — Hiển thị khi danh sách rỗng hoặc không tìm thấy kết quả lọc.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function EmptyState({
  icon = "🔍",
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
        <span aria-hidden>{icon}</span>
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500"
        >
          <span>{actionLabel}</span>
        </Link>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
