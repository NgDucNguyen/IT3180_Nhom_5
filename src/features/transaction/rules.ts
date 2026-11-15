import type { ApiErrorCode } from "@/lib/api-response";
import {
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  type ListingStatus,
  type PurchaseRequestStatus,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/constants";
import {
  canTransitionListing,
  canTransitionPurchaseRequest,
  canTransitionTransaction,
  isTransactionReadyToComplete,
} from "@/lib/listing-state";

// Kết quả kiểm tra: hợp lệ, hoặc bị từ chối kèm mã lỗi chuẩn của dự án
export type RuleResult =
  | { ok: true }
  | { ok: false; code: ApiErrorCode; status: number; message: string };

const allowed: RuleResult = { ok: true };

function deny(code: ApiErrorCode, status: number, message: string): RuleResult {
  return { ok: false, code, status, message };
}

/** UC-TXN-01: người bán có được chấp nhận yêu cầu mua này không? */
export function checkAcceptPurchaseRequest(params: {
  actorId: string;
  listingSellerId: string;
  requestStatus: PurchaseRequestStatus;
  listingStatus: ListingStatus;
}): RuleResult {
  // Quy tắc 1: chỉ chủ tin được chấp nhận
  if (params.actorId !== params.listingSellerId) {
    return deny("FORBIDDEN", 403, "Bạn không phải chủ tin đăng của yêu cầu này");
  }
  // Quy tắc 2: chỉ request PENDING
  if (
    !canTransitionPurchaseRequest(
      params.requestStatus,
      PURCHASE_REQUEST_STATUS.ACCEPTED,
    )
  ) {
    return deny("CONFLICT", 409, "Yêu cầu mua không còn ở trạng thái PENDING");
  }
  // Quy tắc 3 và 13: chỉ listing ACTIVE mới khóa được
  if (!canTransitionListing(params.listingStatus, LISTING_STATUS.IN_TRANSACTION)) {
    return deny("CONFLICT", 409, "Tin đăng không còn ở trạng thái ACTIVE");
  }
  return allowed;
}

/** UC-TXN-02: người bán có được từ chối yêu cầu mua này không? */
export function checkRejectPurchaseRequest(params: {
  actorId: string;
  listingSellerId: string;
  requestStatus: PurchaseRequestStatus;
}): RuleResult {
  if (params.actorId !== params.listingSellerId) {
    return deny("FORBIDDEN", 403, "Bạn không phải chủ tin đăng của yêu cầu này");
  }
  if (
    !canTransitionPurchaseRequest(
      params.requestStatus,
      PURCHASE_REQUEST_STATUS.REJECTED,
    )
  ) {
    return deny("CONFLICT", 409, "Yêu cầu mua không còn ở trạng thái PENDING");
  }
  return allowed;
}

/** UC-TXN-04 và UC-TXN-05: người gọi có được xác nhận / hủy giao dịch này không? */
export function checkCanActOnTransaction(params: {
  actorId: string;
  buyerId: string;
  sellerId: string;
  status: TransactionStatus;
  type: TransactionType;
}): RuleResult {
  // Quy tắc 9: chỉ buyer hoặc seller
  if (params.actorId !== params.buyerId && params.actorId !== params.sellerId) {
    return deny("FORBIDDEN", 403, "Bạn không thuộc giao dịch này");
  }
  // Quy tắc 8: COMPLETED và CANCELLED là trạng thái cuối
  if (!canTransitionTransaction(params.status, TRANSACTION_STATUS.COMPLETED)) {
    return deny("CONFLICT", 409, "Giao dịch không còn ở trạng thái IN_PROGRESS");
  }
  // Quy tắc 11: Sprint 1 chỉ xử lý giao dịch mua
  if (params.type !== TRANSACTION_TYPE.PURCHASE) {
    return deny("CONFLICT", 409, "Chưa hỗ trợ xác nhận giao dịch trao đổi");
  }
  return allowed;
}

/** Tính cờ xác nhận mới: chỉ bật cờ của người gọi, không đụng cờ của bên kia */
export function applyConfirmation(params: {
  actorId: string;
  buyerId: string;
  sellerId: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
}): { buyerConfirmed: boolean; sellerConfirmed: boolean; isReady: boolean } {
  const buyerConfirmed =
    params.buyerConfirmed || params.actorId === params.buyerId;
  const sellerConfirmed =
    params.sellerConfirmed || params.actorId === params.sellerId;
  return {
    buyerConfirmed,
    sellerConfirmed,
    // Quy tắc 6: đủ 2 cờ mới COMPLETED
    isReady: isTransactionReadyToComplete({ buyerConfirmed, sellerConfirmed }),
  };
}

/** Quy tắc 10: người gọi đã xác nhận trước đó chưa (để trả 200 idempotent)? */
export function hasAlreadyConfirmed(params: {
  actorId: string;
  buyerId: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
}): boolean {
  return params.actorId === params.buyerId
    ? params.buyerConfirmed
    : params.sellerConfirmed;
}

/** Quy tắc 7 và 11: trạng thái listing khi giao dịch hoàn tất */
export function getListingStatusOnComplete(type: TransactionType): ListingStatus {
  return type === TRANSACTION_TYPE.EXCHANGE
    ? LISTING_STATUS.EXCHANGED
    : LISTING_STATUS.SOLD;
}