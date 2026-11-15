import {
  PURCHASE_REQUEST_STATUS,
  isListingStatus,
  isPurchaseRequestStatus,
} from "@/lib/constants";
import {
  canTransitionPurchaseRequest,
  isListingAvailableForDeal,
} from "@/lib/listing-state";
import type {
  CancelPurchaseRequestValidationInput,
  PurchaseRequestValidationInput,
  PurchaseValidationResult,
} from "./types";

/**
 * Khung nghiệp vụ Sprint 1: kiểm tra dữ liệu đã nạp, không đọc/ghi DB.
 * buyerId phải lấy từ phiên đăng nhập; listing và existingRequests lấy từ DB.
 * Khi tích hợp API, phải kiểm tra lại và ghi trong cùng transaction để chống gửi trùng.
 */
export function validatePurchaseRequest({
  buyerId,
  offeredPrice,
  listing,
  existingRequests,
}: PurchaseRequestValidationInput): PurchaseValidationResult {
  // Giá 0 giữ nguyên ý nghĩa đồng ý giá niêm yết; không tự ép chuỗi thành số.
  if (
    typeof offeredPrice !== "number" ||
    !Number.isInteger(offeredPrice) ||
    offeredPrice < 0 ||
    offeredPrice > 2_147_483_647
  ) {
    return {
      valid: false,
      status: 400,
      error: {
        code: "VALIDATION_ERROR",
        message: "Giá đề xuất phải là số nguyên từ 0 đến 2147483647 VND.",
      },
    };
  }

  if (!listing) {
    return {
      valid: false,
      status: 404,
      error: { code: "NOT_FOUND", message: "Không tìm thấy tin đăng." },
    };
  }

  if (!isListingStatus(listing.status) || !isListingAvailableForDeal(listing.status)) {
    return {
      valid: false,
      status: 409,
      error: { code: "CONFLICT", message: "Tin đăng hiện không nhận yêu cầu mua." },
    };
  }

  if (buyerId === listing.sellerId) {
    return {
      valid: false,
      status: 400,
      error: { code: "VALIDATION_ERROR", message: "Không được mua tin của chính mình." },
    };
  }

  // Chỉ yêu cầu PENDING trùng cả người mua lẫn tin đăng mới chặn gửi mới.
  const hasPendingRequest = existingRequests.some(
    (request) =>
      request.buyerId === buyerId &&
      request.listingId === listing.id &&
      request.status === PURCHASE_REQUEST_STATUS.PENDING,
  );
  if (hasPendingRequest) {
    return {
      valid: false,
      status: 409,
      error: { code: "CONFLICT", message: "Bạn đã có yêu cầu mua đang chờ phản hồi trên tin này." },
    };
  }

  return { valid: true };
}

/** Chỉ kiểm tra quyền và trạng thái; việc cập nhật có điều kiện thuộc API Sprint 2. */
export function validateCancelPurchaseRequest({
  buyerId,
  request,
}: CancelPurchaseRequestValidationInput): PurchaseValidationResult {
  if (!request) {
    return {
      valid: false,
      status: 404,
      error: { code: "NOT_FOUND", message: "Không tìm thấy yêu cầu mua." },
    };
  }

  if (buyerId !== request.buyerId) {
    return {
      valid: false,
      status: 403,
      error: { code: "FORBIDDEN", message: "Chỉ người mua sở hữu yêu cầu mới được hủy." },
    };
  }

  if (
    !isPurchaseRequestStatus(request.status) ||
    !canTransitionPurchaseRequest(request.status, PURCHASE_REQUEST_STATUS.CANCELLED)
  ) {
    return {
      valid: false,
      status: 409,
      error: { code: "CONFLICT", message: "Chỉ được hủy yêu cầu mua đang chờ phản hồi." },
    };
  }

  return { valid: true };
}
