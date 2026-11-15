/**
 * ============================================================================
 * QUY TẮC CHUYỂN TRẠNG THÁI (STATE MACHINE)
 * ----------------------------------------------------------------------------
 * Đây là bản mã hoá của quy tắc nghiệp vụ trong PROJECT PROPOSAL.
 * Mọi module (Listing, PurchaseRequest, ExchangeOffer, Transaction) PHẢI dùng
 * các hàm dưới đây thay vì tự so sánh chuỗi trạng thái.
 *
 * Chủ sở hữu: TV2 (chốt quy tắc) - TV5/TV6/TV7/TV8 (sử dụng).
 * File này là pure function, không phụ thuộc DB => test được độc lập.
 * ============================================================================
 */

import {
  EXCHANGE_OFFER_STATUS,
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  TRANSACTION_STATUS,
  type ExchangeOfferStatus,
  type ListingStatus,
  type PurchaseRequestStatus,
  type TransactionStatus,
} from "@/lib/constants";

/* ===========================================================================
 * LISTING
 * ===========================================================================
 * PENDING  --Admin duyệt-->            ACTIVE
 * PENDING  --Admin từ chối-->          REJECTED
 * ACTIVE   --Người bán ẩn-->           HIDDEN
 * HIDDEN   --Người bán bỏ ẩn-->         ACTIVE
 * ACTIVE   --Bắt đầu giao dịch-->      IN_TRANSACTION
 * ACTIVE   --Admin ẩn-->               HIDDEN
 * IN_TRANSACTION --Hủy giao dịch-->    ACTIVE
 * IN_TRANSACTION --Hoàn tất mua-->     SOLD
 * IN_TRANSACTION --Hoàn tất trao đổi-> EXCHANGED
 * REJECTED --Người bán sửa tin-->      PENDING  (bắt buộc duyệt lại)
 *
 * LUẬT BẤT BIẾN:
 *  - SOLD / EXCHANGED là trạng thái cuối, không quay lại được.
 *  - Một listing chỉ được nằm trong tối đa 1 giao dịch IN_TRANSACTION.
 */
export const LISTING_TRANSITIONS: Record<ListingStatus, ListingStatus[]> = {
  PENDING: [LISTING_STATUS.ACTIVE, LISTING_STATUS.REJECTED],
  ACTIVE: [
    LISTING_STATUS.IN_TRANSACTION,
    LISTING_STATUS.HIDDEN,
    LISTING_STATUS.REJECTED,
  ],
  IN_TRANSACTION: [
    LISTING_STATUS.ACTIVE,
    LISTING_STATUS.SOLD,
    LISTING_STATUS.EXCHANGED,
  ],
  SOLD: [],
  EXCHANGED: [],
  REJECTED: [LISTING_STATUS.PENDING],
  HIDDEN: [LISTING_STATUS.ACTIVE, LISTING_STATUS.REJECTED],
};

export function canTransitionListing(
  from: ListingStatus,
  to: ListingStatus,
): boolean {
  return LISTING_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertListingTransition(
  from: ListingStatus,
  to: ListingStatus,
): void {
  if (!canTransitionListing(from, to)) {
    throw new Error(`Chuyển trạng thái Listing không hợp lệ: ${from} -> ${to}`);
  }
}

/** Tin đăng có hiển thị công khai không? */
export function isListingPubliclyVisible(status: ListingStatus): boolean {
  return status === LISTING_STATUS.ACTIVE;
}

/** Tin đăng có thể nhận yêu cầu mua / đề nghị trao đổi mới không? */
export function isListingAvailableForDeal(status: ListingStatus): boolean {
  return status === LISTING_STATUS.ACTIVE;
}

/** Người bán có được sửa tin không? */
export function isListingEditable(status: ListingStatus): boolean {
  return status !== LISTING_STATUS.IN_TRANSACTION && status !== LISTING_STATUS.SOLD
    && status !== LISTING_STATUS.EXCHANGED;
}

/* ===========================================================================
 * PURCHASE REQUEST
 * ===========================================================================
 * PENDING --người bán nhận--> ACCEPTED  => sinh Transaction
 * PENDING --người bán từ chối-> REJECTED
 * PENDING --người mua hủy-->   CANCELLED
 * ACCEPTED / REJECTED / CANCELLED là trạng thái cuối.
 */
export const PURCHASE_REQUEST_TRANSITIONS: Record<
  PurchaseRequestStatus,
  PurchaseRequestStatus[]
> = {
  PENDING: [
    PURCHASE_REQUEST_STATUS.ACCEPTED,
    PURCHASE_REQUEST_STATUS.REJECTED,
    PURCHASE_REQUEST_STATUS.CANCELLED,
  ],
  ACCEPTED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionPurchaseRequest(
  from: PurchaseRequestStatus,
  to: PurchaseRequestStatus,
): boolean {
  return PURCHASE_REQUEST_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertPurchaseRequestTransition(
  from: PurchaseRequestStatus,
  to: PurchaseRequestStatus,
): void {
  if (!canTransitionPurchaseRequest(from, to)) {
    throw new Error(
      `Chuyển trạng thái PurchaseRequest không hợp lệ: ${from} -> ${to}`,
    );
  }
}

/* ===========================================================================
 * EXCHANGE OFFER
 * ===========================================================================
 * PENDING --người nhận đồng ý--> ACCEPTED => sinh Transaction (EXCHANGE)
 * PENDING --người nhận từ chối-> REJECTED
 * PENDING --người đề nghị hủy--> CANCELLED
 * ACCEPTED / REJECTED / CANCELLED là trạng thái cuối.
 */
export const EXCHANGE_OFFER_TRANSITIONS: Record<
  ExchangeOfferStatus,
  ExchangeOfferStatus[]
> = {
  PENDING: [
    EXCHANGE_OFFER_STATUS.ACCEPTED,
    EXCHANGE_OFFER_STATUS.REJECTED,
    EXCHANGE_OFFER_STATUS.CANCELLED,
  ],
  ACCEPTED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function canTransitionExchangeOffer(
  from: ExchangeOfferStatus,
  to: ExchangeOfferStatus,
): boolean {
  return EXCHANGE_OFFER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertExchangeOfferTransition(
  from: ExchangeOfferStatus,
  to: ExchangeOfferStatus,
): void {
  if (!canTransitionExchangeOffer(from, to)) {
    throw new Error(
      `Chuyển trạng thái ExchangeOffer không hợp lệ: ${from} -> ${to}`,
    );
  }
}

/* ===========================================================================
 * TRANSACTION
 * ===========================================================================
 * IN_PROGRESS --cả 2 bên xác nhận--> COMPLETED
 * IN_PROGRESS --một bên hủy--------> CANCELLED
 * COMPLETED / CANCELLED là trạng thái cuối.
 *
 * LUẬT: chỉ COMPLETED khi buyerConfirmed && sellerConfirmed.
 */
export const TRANSACTION_TRANSITIONS: Record<
  TransactionStatus,
  TransactionStatus[]
> = {
  IN_PROGRESS: [TRANSACTION_STATUS.COMPLETED, TRANSACTION_STATUS.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionTransaction(
  from: TransactionStatus,
  to: TransactionStatus,
): boolean {
  return TRANSACTION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransactionTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): void {
  if (!canTransitionTransaction(from, to)) {
    throw new Error(
      `Chuyển trạng thái Transaction không hợp lệ: ${from} -> ${to}`,
    );
  }
}

/** Giao dịch đã đủ điều kiện hoàn tất chưa? */
export function isTransactionReadyToComplete(params: {
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
}): boolean {
  return params.buyerConfirmed && params.sellerConfirmed;
}
