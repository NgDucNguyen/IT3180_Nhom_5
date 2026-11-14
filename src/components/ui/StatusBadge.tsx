import {
  CONDITION,
  CONDITION_LABEL_VI,
  EXCHANGE_OFFER_STATUS,
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  REPORT_STATUS,
  TRANSACTION_STATUS,
  USER_STATUS,
  type Condition,
} from "@/lib/constants";

export type StatusEntity =
  | "listing"
  | "purchaseRequest"
  | "exchangeOffer"
  | "transaction"
  | "report"
  | "condition"
  | "user";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "exchange"
  | "neutral";

export interface StatusBadgeMeta {
  label: string;
  tone: BadgeTone;
  badgeClass: string;
  dotClass: string;
}

const TONE_STYLES: Record<BadgeTone, { badgeClass: string; dotClass: string }> = {
  success: {
    badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    dotClass: "bg-emerald-500",
  },
  warning: {
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/25",
    dotClass: "bg-amber-500",
  },
  danger: {
    badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
    dotClass: "bg-rose-500",
  },
  info: {
    badgeClass: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
    dotClass: "bg-indigo-500",
  },
  exchange: {
    badgeClass: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/25",
    dotClass: "bg-violet-500",
  },
  neutral: {
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20",
    dotClass: "bg-slate-400",
  },
};

function createMeta(label: string, tone: BadgeTone): StatusBadgeMeta {
  return {
    label,
    tone,
    ...TONE_STYLES[tone],
  };
}

/**
 * Tra cứu nhãn tiếng Việt & màu sắc chuẩn cho mọi trạng thái trong hệ thống.
 * Dùng các hằng số từ `@/lib/constants` để đảm bảo tính nhất quán.
 */
export function getStatusBadgeMeta(
  status: string,
  entity?: StatusEntity,
): StatusBadgeMeta {
  // 1. Nhãn tình trạng phần cứng (Condition)
  if (
    entity === "condition" ||
    status === CONDITION.NEW ||
    status === CONDITION.LIKE_NEW ||
    status === CONDITION.GOOD ||
    status === CONDITION.FAIR
  ) {
    if (status === CONDITION.NEW) {
      return createMeta(CONDITION_LABEL_VI.NEW, "success");
    }
    if (status === CONDITION.LIKE_NEW) {
      return createMeta(CONDITION_LABEL_VI.LIKE_NEW, "info");
    }
    if (status === CONDITION.GOOD) {
      return createMeta(CONDITION_LABEL_VI.GOOD, "neutral");
    }
    if (status === CONDITION.FAIR) {
      return createMeta(CONDITION_LABEL_VI.FAIR, "warning");
    }
  }

  // 2. Nhãn trạng thái theo từng thực thể cụ thể
  if (entity === "purchaseRequest") {
    switch (status) {
      case PURCHASE_REQUEST_STATUS.PENDING:
        return createMeta("Chờ người bán phản hồi", "warning");
      case PURCHASE_REQUEST_STATUS.ACCEPTED:
        return createMeta("Đã chấp nhận mua", "success");
      case PURCHASE_REQUEST_STATUS.REJECTED:
        return createMeta("Từ chối yêu cầu", "danger");
      case PURCHASE_REQUEST_STATUS.CANCELLED:
        return createMeta("Đã huỷ yêu cầu", "neutral");
    }
  }

  if (entity === "exchangeOffer") {
    switch (status) {
      case EXCHANGE_OFFER_STATUS.PENDING:
        return createMeta("Chờ duyệt đổi máy", "warning");
      case EXCHANGE_OFFER_STATUS.ACCEPTED:
        return createMeta("Đồng ý trao đổi", "exchange");
      case EXCHANGE_OFFER_STATUS.REJECTED:
        return createMeta("Từ chối trao đổi", "danger");
      case EXCHANGE_OFFER_STATUS.CANCELLED:
        return createMeta("Đã huỷ đề nghị", "neutral");
    }
  }

  if (entity === "transaction") {
    switch (status) {
      case TRANSACTION_STATUS.IN_PROGRESS:
        return createMeta("Đang giao dịch", "info");
      case TRANSACTION_STATUS.COMPLETED:
        return createMeta("Giao dịch hoàn tất", "success");
      case TRANSACTION_STATUS.CANCELLED:
        return createMeta("Giao dịch đã huỷ", "danger");
    }
  }

  if (entity === "report") {
    switch (status) {
      case REPORT_STATUS.PENDING:
        return createMeta("Chờ xử lý báo cáo", "warning");
      case REPORT_STATUS.RESOLVED:
        return createMeta("Đã xử lý vi phạm", "success");
      case REPORT_STATUS.DISMISSED:
        return createMeta("Bác bỏ báo cáo", "neutral");
    }
  }

  if (entity === "user") {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return createMeta("Tài khoản hoạt động", "success");
      case USER_STATUS.LOCKED:
        return createMeta("Tài khoản bị khoá", "danger");
    }
  }

  // 3. Mặc định hoặc entity === "listing" (đồng thời fallback cho mọi status chung)
  switch (status) {
    case LISTING_STATUS.ACTIVE:
      return createMeta("Đang bán", "success");
    case LISTING_STATUS.PENDING:
      return createMeta("Chờ duyệt", "warning");
    case LISTING_STATUS.IN_TRANSACTION:
      return createMeta("Đang giao dịch", "info");
    case LISTING_STATUS.SOLD:
      return createMeta("Đã bán", "neutral");
    case LISTING_STATUS.EXCHANGED:
      return createMeta("Đã trao đổi", "exchange");
    case LISTING_STATUS.REJECTED:
      return createMeta("Bị từ chối", "danger");
    case LISTING_STATUS.HIDDEN:
      return createMeta("Đã ẩn", "neutral");
    case PURCHASE_REQUEST_STATUS.ACCEPTED:
      return createMeta("Đã chấp nhận", "success");
    case PURCHASE_REQUEST_STATUS.CANCELLED:
      return createMeta("Đã huỷ", "neutral");
    case TRANSACTION_STATUS.IN_PROGRESS:
      return createMeta("Đang thực hiện", "info");
    case TRANSACTION_STATUS.COMPLETED:
      return createMeta("Hoàn tất", "success");
    case REPORT_STATUS.RESOLVED:
      return createMeta("Đã xử lý", "success");
    case REPORT_STATUS.DISMISSED:
      return createMeta("Đã bỏ qua", "neutral");
    case USER_STATUS.LOCKED:
      return createMeta("Đã khoá", "danger");
    default:
      return createMeta(status, "neutral");
  }
}

export interface StatusBadgeProps {
  status: string | Condition;
  entity?: StatusEntity;
  showDot?: boolean;
  size?: "sm" | "md";
  customLabel?: string;
  className?: string;
}

/**
 * StatusBadge — Component hiển thị nhãn màu sắc thống nhất cho mọi trạng thái
 * của Listing, PurchaseRequest, ExchangeOffer, Transaction, Report, Condition và User.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function StatusBadge({
  status,
  entity,
  showDot = true,
  size = "sm",
  customLabel,
  className = "",
}: StatusBadgeProps) {
  const meta = getStatusBadgeMeta(status, entity);
  const sizeClass =
    size === "md"
      ? "px-2.5 py-1 text-xs font-semibold"
      : "px-2 py-0.5 text-[11px] font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} ${meta.badgeClass} ${className}`.trim()}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`}
          aria-hidden
        />
      )}
      <span>{customLabel ?? meta.label}</span>
    </span>
  );
}
