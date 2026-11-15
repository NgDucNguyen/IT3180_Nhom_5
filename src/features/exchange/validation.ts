import type { ApiErrorCode } from "@/lib/api-response";
import type { ListingStatus } from "@/lib/constants";
import { isListingAvailableForDeal } from "@/lib/listing-state";

export interface ExchangeListing {
  id: string;
  sellerId: string;
  status: ListingStatus;
  allowExchange: boolean;
}

export interface CreateExchangeOfferInput {
  proposerId: string;
  targetListing: ExchangeListing;
  offeredListing: ExchangeListing;
  cashTopUp: number;
  hasPendingOffer: boolean;
}

export type ExchangeValidationResult =
  | { valid: true }
  | {
      valid: false;
      code: ApiErrorCode;
      message: string;
    };

/**
 * Kiểm tra điều kiện gửi đề nghị trên dữ liệu đã đọc từ backend.
 * hasPendingOffer ứng với cùng cặp tin mục tiêu và tin đem đổi.
 * Hàm không truy cập DB hoặc thay đổi dữ liệu đầu vào.
 */
export function validateCreateExchangeOffer(
  input: CreateExchangeOfferInput,
): ExchangeValidationResult {
  const {
    proposerId,
    targetListing,
    offeredListing,
    cashTopUp,
    hasPendingOffer,
  } = input;

  if (targetListing.id === offeredListing.id) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: "Hai thiết bị trao đổi phải là hai tin đăng khác nhau.",
    };
  }

  if (targetListing.sellerId === proposerId) {
    return {
      valid: false,
      code: "FORBIDDEN",
      message: "Không được đề nghị trao đổi tin đăng của chính mình.",
    };
  }

  if (offeredListing.sellerId !== proposerId) {
    return {
      valid: false,
      code: "FORBIDDEN",
      message: "Thiết bị đem trao đổi phải thuộc sở hữu của bạn.",
    };
  }

  if (
    !isListingAvailableForDeal(targetListing.status) ||
    !isListingAvailableForDeal(offeredListing.status)
  ) {
    return {
      valid: false,
      code: "CONFLICT",
      message: "Cả hai thiết bị phải đang ở trạng thái hoạt động.",
    };
  }

  if (!targetListing.allowExchange) {
    return {
      valid: false,
      code: "CONFLICT",
      message: "Tin đăng mục tiêu không nhận trao đổi.",
    };
  }

  // Tiền bù phải nằm trong miền số nguyên có dấu 32 bit của Prisma Int.
  if (
    !Number.isInteger(cashTopUp) ||
    cashTopUp < 0 ||
    cashTopUp > 2_147_483_647
  ) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: "Tiền bù phải là số nguyên từ 0 đến 2.147.483.647 VND.",
    };
  }

  if (hasPendingOffer) {
    return {
      valid: false,
      code: "CONFLICT",
      message: "Đã có đề nghị đang chờ xử lý cho cặp thiết bị này.",
    };
  }

  return { valid: true };
}