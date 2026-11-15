import { describe, expect, it } from "vitest";
import { LISTING_STATUS } from "@/lib/constants";
import {
  assertExchangeOfferTransition,
  assertListingTransition,
  assertPurchaseRequestTransition,
  assertTransactionTransition,
  canTransitionExchangeOffer,
  canTransitionListing,
  canTransitionPurchaseRequest,
  canTransitionTransaction,
  isListingAvailableForDeal,
  isListingEditable,
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
    expect(() =>
      assertListingTransition(LISTING_STATUS.SOLD, LISTING_STATUS.ACTIVE),
    ).toThrow("không hợp lệ");
  });

  it("Hoàn tất giao dịch: IN_TRANSACTION -> SOLD / EXCHANGED", () => {
    expect(
      canTransitionListing(LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.SOLD),
    ).toBe(true);
    expect(
      canTransitionListing(
        LISTING_STATUS.IN_TRANSACTION,
        LISTING_STATUS.EXCHANGED,
      ),
    ).toBe(true);
  });

  it("Hủy giao dịch đưa tin về ACTIVE", () => {
    expect(
      canTransitionListing(LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.ACTIVE),
    ).toBe(true);
  });

  it("Chặn sửa tin khi đang IN_TRANSACTION, SOLD hoặc EXCHANGED", () => {
    expect(isListingEditable(LISTING_STATUS.ACTIVE)).toBe(true);
    expect(isListingEditable(LISTING_STATUS.PENDING)).toBe(true);
    expect(isListingEditable(LISTING_STATUS.REJECTED)).toBe(true);
    expect(isListingEditable(LISTING_STATUS.IN_TRANSACTION)).toBe(false);
    expect(isListingEditable(LISTING_STATUS.SOLD)).toBe(false);
    expect(isListingEditable(LISTING_STATUS.EXCHANGED)).toBe(false);
  });
});

describe("PurchaseRequest & ExchangeOffer state machine", () => {
  it("PurchaseRequest chỉ xử lý được khi còn PENDING", () => {
    expect(canTransitionPurchaseRequest("PENDING", "ACCEPTED")).toBe(true);
    expect(canTransitionPurchaseRequest("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionPurchaseRequest("ACCEPTED", "REJECTED")).toBe(false);
    expect(() =>
      assertPurchaseRequestTransition("ACCEPTED", "REJECTED"),
    ).toThrow("không hợp lệ");
  });

  it("ExchangeOffer chỉ xử lý được khi còn PENDING", () => {
    expect(canTransitionExchangeOffer("PENDING", "ACCEPTED")).toBe(true);
    expect(canTransitionExchangeOffer("PENDING", "REJECTED")).toBe(true);
    expect(canTransitionExchangeOffer("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionExchangeOffer("CANCELLED", "ACCEPTED")).toBe(false);
    expect(() =>
      assertExchangeOfferTransition("CANCELLED", "ACCEPTED"),
    ).toThrow("không hợp lệ");
  });
});

describe("Transaction state machine", () => {
  it("Chỉ COMPLETED khi cả 2 bên xác nhận", () => {
    expect(isTransactionReadyToComplete({ buyerConfirmed: true, sellerConfirmed: true })).toBe(true);
    expect(isTransactionReadyToComplete({ buyerConfirmed: true, sellerConfirmed: false })).toBe(false);
  });

  it("COMPLETED là trạng thái cuối", () => {
    expect(canTransitionTransaction("COMPLETED", "CANCELLED")).toBe(false);
    expect(() => assertTransactionTransition("COMPLETED", "CANCELLED")).toThrow(
      "không hợp lệ",
    );
  });
});
