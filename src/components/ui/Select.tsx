import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

/**
 * Select — Hộp chọn (Dropdown) dùng chung cho Danh mục, Thương hiệu, Tình trạng máy, Sắp xếp.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      id,
      required,
      disabled,
      children,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref,
  ) {
    const selectId = id ?? rest.name;
    const hasError = Boolean(error);

    return (
      <div className={`w-full ${containerClassName}`.trim()}>
        {label && (
          <label
            htmlFor={selectId}
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

        <select
          ref={ref}
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
            hasError
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20"
          } ${className}`.trim()}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

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
