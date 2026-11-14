/**
 * Định dạng số nguyên VND thành chuỗi tiền tệ chuẩn tiếng Việt.
 * Ví dụ: 25900000 -> "25.900.000 ₫"
 */
export function formatPriceVnd(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    return "0 ₫";
  }
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

export interface PriceTextProps {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Component hiển thị giá tiền VNĐ thống nhất toàn sàn.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function PriceText({
  amount,
  size = "md",
  className = "",
}: PriceTextProps) {
  const sizeStyles = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
    xl: "text-2xl sm:text-3xl font-extrabold tracking-tight",
  }[size];

  return (
    <span className={`text-indigo-600 ${sizeStyles} ${className}`.trim()}>
      {formatPriceVnd(amount)}
    </span>
  );
}
