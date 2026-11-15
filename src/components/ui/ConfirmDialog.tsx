"use client";

import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * ConfirmDialog — Hộp thoại xác nhận hành động quan trọng dùng chung:
 *  - Ẩn / Bỏ ẩn tin bán (TV3)
 *  - Huỷ yêu cầu mua / đề nghị trao đổi (TV5, TV7)
 *  - Xác nhận hoàn tất hoặc huỷ giao dịch (TV6)
 *  - Duyệt / Từ chối tin hoặc Khoá tài khoản (TV8)
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ bỏ",
  confirmVariant = "primary",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Đang xử lý..." : confirmLabel}
          </Button>
        </>
      }
    >
      {children ? (
        <div className="text-xs leading-relaxed text-slate-600">{children}</div>
      ) : (
        <p className="text-xs leading-relaxed text-slate-600">{description}</p>
      )}
    </Modal>
  );
}
