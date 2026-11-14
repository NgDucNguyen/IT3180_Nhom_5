import { describe, expect, it } from "vitest";
import { LISTING_STATUS } from "@/lib/constants";
import {
  canTransitionListing,
  canTransitionPurchaseRequest,
  canTransitionTransaction,
  isListingAvailableForDeal,
  isListingPubliclyVisible,
  isTransactionReadyToComplete,
} from "@/lib/listing-state";

/**
 * TEST NỀN (do TV2 viết, TV8 mở rộng)
 * Kiểm tra quy tắc chuyển trạng thái - phần dễ bị phá nhất khi 8 người
 * cùng sửa code.
 */
describe("Listing state machine", () => {
  it("Admin duyệt: PENDING -> ACTIVE", () => {
    expect(canTransitionListing(LISTING_STATUS.PENDING, LISTING_STATUS.ACTIVE)).toBe(true);
  });

  it("Chỉ tin ACTIVE mới hiển thị công khai", () => {
    expect(isListingPubliclyVisible(LISTING_STATUS.ACTIVE)).toBe(true);
    expect(isListingPubliclyVisible(LISTING_STATUS.PENDING)).toBe(false);
    expect(isListingPubliclyVisible(LISTING_STATUS.HIDDEN)).toBe(false);
  });

  it("Không thể mua/trao đổi tin đang HIDDEN hoặc IN_TRANSACTION", () => {
    expect(isListingAvailableForDeal(LISTING_STATUS.ACTIVE)).toBe(true);
    expect(isListingAvailableForDeal(LISTING_STATUS.HIDDEN)).toBe(false);
    expect(isListingAvailableForDeal(LISTING_STATUS.IN_TRANSACTION)).toBe(false);
    expect(isListingAvailableForDeal(LISTING_STATUS.SOLD)).toBe(false);
  });

  it("SOLD là trạng thái cuối, không quay lại được", () => {
    expect(canTransitionListing(LISTING_STATUS.SOLD, LISTING_STATUS.ACTIVE)).toBe(false);
    expect(canTransitionListing(LISTING_STATUS.SOLD, LISTING_STATUS.PENDING)).toBe(false);
  });

  it("Hoàn tất giao dịch: IN_TRANSACTION -> SOLD", () => {
    expect(
      canTransitionListing(LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.SOLD),
    ).toBe(true);
  });

  it("Hủy giao dịch đưa tin về ACTIVE", () => {
    expect(
      canTransitionListing(LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.ACTIVE),
    ).toBe(true);
  });
});

describe("PurchaseRequest state machine", () => {
  it("Chỉ xử lý được khi còn PENDING", () => {
    expect(canTransitionPurchaseRequest("PENDING", "ACCEPTED")).toBe(true);
    expect(canTransitionPurchaseRequest("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionPurchaseRequest("ACCEPTED", "REJECTED")).toBe(false);
  });
});

describe("Transaction state machine", () => {
  it("Chỉ COMPLETED khi cả 2 bên xác nhận", () => {
    expect(isTransactionReadyToComplete({ buyerConfirmed: true, sellerConfirmed: true })).toBe(true);
    expect(isTransactionReadyToComplete({ buyerConfirmed: true, sellerConfirmed: false })).toBe(false);
  });

  it("COMPLETED là trạng thái cuối", () => {
    expect(canTransitionTransaction("COMPLETED", "CANCELLED")).toBe(false);
  });
});
