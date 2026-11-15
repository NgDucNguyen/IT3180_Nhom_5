import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  containerClassName?: string;
}

/**
 * Input — Ô nhập liệu văn bản / số dùng chung cho toàn bộ các Form (TV1, TV3, TV5, TV7, TV8).
 * Hỗ trợ label, thông báo lỗi validation, ghi chú phụ và addon trái/phải.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    leftAddon,
    rightAddon,
    id,
    required,
    disabled,
    className = "",
    containerClassName = "",
    ...rest
  },
  ref,
) {
  const inputId = id ?? rest.name;
  const hasError = Boolean(error);

  return (
    <div className={`w-full ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-bold text-slate-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-rose-600" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="pointer-events-none absolute left-3 inline-flex items-center text-xs text-slate-400">
            {leftAddon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError && inputId
              ? `${inputId}-error`
              : helperText && inputId
                ? `${inputId}-helper`
                : undefined
          }
          className={`w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
            leftAddon ? "pl-9" : "pl-3.5"
          } ${rightAddon ? "pr-10" : "pr-3.5"} ${
            hasError
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20"
          } ${className}`.trim()}
          {...rest}
        />

        {rightAddon && (
          <span className=" absolute right-3 inline-flex items-center text-xs text-slate-500">
            {rightAddon}
          </span>
        )}
      </div>

      {hasError ? (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          role="alert"
          className="mt-1.5 text-xs font-medium text-rose-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={inputId ? `${inputId}-helper` : undefined}
          className="mt-1.5 text-xs text-slate-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
