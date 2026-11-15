import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

/**
 * Textarea — Ô nhập văn bản nhiều dòng dùng chung (Mô tả thiết bị TV3, Lời nhắn mua TV5, Lý do báo cáo TV8).
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      helperText,
      error,
      id,
      required,
      disabled,
      rows = 4,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref,
  ) {
    const textareaId = id ?? rest.name;
    const hasError = Boolean(error);

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        {label && (
          <label
            htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
            hasError
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20"
          } ${className}`.trim()}
          {...rest}
        />

        {hasError ? (
          <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
