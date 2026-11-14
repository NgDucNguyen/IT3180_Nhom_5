import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "exchange"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 focus-visible:ring-indigo-500",
  secondary:
    "bg-slate-900 text-white shadow-xs hover:bg-slate-800 focus-visible:ring-slate-700",
  exchange:
    "bg-violet-600 text-white shadow-xs hover:bg-violet-500 focus-visible:ring-violet-500",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-indigo-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
  danger:
    "bg-rose-600 text-white shadow-xs hover:bg-rose-500 focus-visible:ring-rose-500",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg",
  md: "px-4 py-2 text-sm font-semibold rounded-xl",
  lg: "px-5 py-2.5 text-sm font-semibold rounded-xl",
};

/**
 * Button — Nút bấm chuẩn Design System cho cả 8 phân hệ.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
