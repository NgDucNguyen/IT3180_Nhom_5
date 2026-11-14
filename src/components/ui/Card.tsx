import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card — Khung hiển thị nội dung dùng chung.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`.trim()}
    >
      {children}
    </div>
  );
}
