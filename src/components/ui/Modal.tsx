"use client";

import { useEffect, type ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
}

const MODAL_SIZE_STYLES: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal — Hộp thoại nổi (Dialog) dùng chung cho các tác vụ:
 *  - Gửi yêu cầu mua (TV5)
 *  - Đề nghị trao đổi thiết bị (TV7)
 *  - Báo cáo vi phạm (TV8)
 *  - Xác nhận ẩn tin / huỷ giao dịch (TV3, TV6)
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="electroswap-modal-title"
    >
      {/* Lớp nền mờ */}
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hộp nội dung Modal */}
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${MODAL_SIZE_STYLES[size]} ${className}`.trim()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="electroswap-modal-title"
              className="text-base font-extrabold text-slate-900 sm:text-lg"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 text-sm text-slate-700 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
