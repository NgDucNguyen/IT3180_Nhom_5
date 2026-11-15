/**
 * ============================================================================
 * NGUỒN SỰ THẬT DUY NHẤT CHO CÁC GIÁ TRỊ CỐ ĐỊNH
 * ----------------------------------------------------------------------------
 * SQLite không hỗ trợ enum trong Prisma, nên các cột trạng thái là String.
 * File này định nghĩa danh sách giá trị hợp lệ + type tương ứng.
 *
 * QUY TẮC: mọi nơi trong dự án phải import từ đây, KHÔNG hardcode chuỗi.
 *   import { LISTING_STATUS, isListingStatus } from "@/lib/constants";
 *
 * Chủ sở hữu: TV2. Muốn thêm/bớt trạng thái -> mở issue cho TV2.
 * ============================================================================
 */

/* ------------------------------ USER ------------------------------------ */

export const ROLES = {
  /** Người mua mặc định sau khi đăng ký */
  USER: "USER",
  /** Người bán đã nâng cấp mở Shop (vẫn giữ đầy đủ quyền đi mua hàng) */
  SELLER: "SELLER",
  /** Quản trị viên toàn sàn */
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ROLE_VALUES = Object.values(ROLES);

export const SHOP_BANNER_THEMES = {
  INDIGO: "indigo",
  EMERALD: "emerald",
  AMBER: "amber",
  ROSE: "rose",
  SLATE: "slate",
} as const;
export type ShopBannerTheme =
  (typeof SHOP_BANNER_THEMES)[keyof typeof SHOP_BANNER_THEMES];
export const SHOP_BANNER_THEME_VALUES = Object.values(SHOP_BANNER_THEMES);

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export const USER_STATUS_VALUES = Object.values(USER_STATUS);

/* ----------------------------- LISTING ----------------------------------- */

export const LISTING_STATUS = {
  /** Vừa tạo, chờ Admin duyệt */
  PENDING: "PENDING",
  /** Đang hiển thị công khai, có thể mua/trao đổi */
  ACTIVE: "ACTIVE",
  /** Đang bị khóa bởi một giao dịch (mua hoặc trao đổi) */
  IN_TRANSACTION: "IN_TRANSACTION",
  /** Đã bán xong */
  SOLD: "SOLD",
  /** Đã trao đổi xong */
  EXCHANGED: "EXCHANGED",
  /** Admin từ chối duyệt */
  REJECTED: "REJECTED",
  /** Người bán tự ẩn */
  HIDDEN: "HIDDEN",
} as const;
export type ListingStatus =
  (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];
export const LISTING_STATUS_VALUES = Object.values(LISTING_STATUS);

export const CONDITION = {
  NEW: "NEW",
  LIKE_NEW: "LIKE_NEW",
  GOOD: "GOOD",
  FAIR: "FAIR",
} as const;
export type Condition = (typeof CONDITION)[keyof typeof CONDITION];
export const CONDITION_VALUES = Object.values(CONDITION);

export const CONDITION_LABEL_VI: Record<Condition, string> = {
  NEW: "Mới 100%",
  LIKE_NEW: "Như mới",
  GOOD: "Tốt",
  FAIR: "Đã qua sử dụng",
};

/* ------------------------- PURCHASE REQUEST ------------------------------ */

export const PURCHASE_REQUEST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type PurchaseRequestStatus =
  (typeof PURCHASE_REQUEST_STATUS)[keyof typeof PURCHASE_REQUEST_STATUS];
export const PURCHASE_REQUEST_STATUS_VALUES = Object.values(
  PURCHASE_REQUEST_STATUS,
);

/* --------------------------- EXCHANGE OFFER ------------------------------ */

export const EXCHANGE_OFFER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type ExchangeOfferStatus =
  (typeof EXCHANGE_OFFER_STATUS)[keyof typeof EXCHANGE_OFFER_STATUS];
export const EXCHANGE_OFFER_STATUS_VALUES = Object.values(EXCHANGE_OFFER_STATUS);

/* ---------------------------- TRANSACTION -------------------------------- */

export const TRANSACTION_TYPE = {
  PURCHASE: "PURCHASE",
  EXCHANGE: "EXCHANGE",
} as const;
export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPE);

export const TRANSACTION_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];
export const TRANSACTION_STATUS_VALUES = Object.values(TRANSACTION_STATUS);

/* ------------------------------- REPORT ---------------------------------- */

export const REPORT_STATUS = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
export const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);

/* ---------------------------- TYPE GUARDS -------------------------------- */

export function isRole(value: string): value is Role {
  return (ROLE_VALUES as string[]).includes(value);
}

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUS_VALUES as string[]).includes(value);
}

export function isListingStatus(value: string): value is ListingStatus {
  return (LISTING_STATUS_VALUES as string[]).includes(value);
}

export function isCondition(value: string): value is Condition {
  return (CONDITION_VALUES as string[]).includes(value);
}

export function isPurchaseRequestStatus(
  value: string,
): value is PurchaseRequestStatus {
  return (PURCHASE_REQUEST_STATUS_VALUES as string[]).includes(value);
}

export function isExchangeOfferStatus(
  value: string,
): value is ExchangeOfferStatus {
  return (EXCHANGE_OFFER_STATUS_VALUES as string[]).includes(value);
}

export function isTransactionType(value: string): value is TransactionType {
  return (TRANSACTION_TYPE_VALUES as string[]).includes(value);
}

export function isTransactionStatus(value: string): value is TransactionStatus {
  return (TRANSACTION_STATUS_VALUES as string[]).includes(value);
}

export function isReportStatus(value: string): value is ReportStatus {
  return (REPORT_STATUS_VALUES as string[]).includes(value);
}
