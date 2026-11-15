import { describe, expect, it } from "vitest";
import {
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
} from "@/lib/constants";
import {
  validateCancelPurchaseRequest,
  validatePurchaseRequest,
} from "@/features/purchase/service";
import type {
  PurchaseRequestSnapshot,
  PurchaseRequestValidationInput,
} from "@/features/purchase/types";

// Dữ liệu giả độc lập DB: Sprint 1 chỉ kiểm thử điều kiện nghiệp vụ.
const listing = Object.freeze({
  id: "listing-1",
  sellerId: "seller-1",
  status: LISTING_STATUS.ACTIVE,
});
const pendingRequest: PurchaseRequestSnapshot = Object.freeze({
  buyerId: "buyer-1",
  listingId: listing.id,
  status: PURCHASE_REQUEST_STATUS.PENDING,
});

function validInput(): PurchaseRequestValidationInput {
  return {
    buyerId: pendingRequest.buyerId,
    offeredPrice: 5_000_000,
    listing,
    existingRequests: [],
  };
}

describe("Gửi yêu cầu mua — INV-PUR-01 đến INV-PUR-04", () => {
  it("Chấp nhận người mua khác chủ tin, tin ACTIVE và giá hợp lệ", () => {
    expect(validatePurchaseRequest(validInput())).toEqual({ valid: true });
  });

  it.each([0, 1, 2_147_483_647])("Chấp nhận giá nguyên hợp lệ %s VND", (offeredPrice) => {
    expect(validatePurchaseRequest({ ...validInput(), offeredPrice })).toEqual({ valid: true });
  });

  it.each([
    LISTING_STATUS.PENDING,
    LISTING_STATUS.REJECTED,
    LISTING_STATUS.HIDDEN,
    LISTING_STATUS.IN_TRANSACTION,
    LISTING_STATUS.SOLD,
    LISTING_STATUS.EXCHANGED,
    "INVALID_STATUS",
  ])("Chặn tin không ACTIVE: %s", (status) => {
    expect(validatePurchaseRequest({ ...validInput(), listing: { ...listing, status } }))
      .toMatchObject({ valid: false, status: 409, error: { code: "CONFLICT" } });
  });

  it("Trả NOT_FOUND khi tin không tồn tại", () => {
    expect(validatePurchaseRequest({ ...validInput(), listing: null }))
      .toMatchObject({ valid: false, status: 404, error: { code: "NOT_FOUND" } });
  });

  it("Chặn người mua gửi yêu cầu trên tin của chính mình", () => {
    expect(validatePurchaseRequest({ ...validInput(), buyerId: listing.sellerId }))
      .toMatchObject({ valid: false, status: 400, error: { code: "VALIDATION_ERROR" } });
  });

  it("Chặn yêu cầu PENDING cùng người mua và tin, kể cả khi nằm cuối danh sách", () => {
    expect(validatePurchaseRequest({
      ...validInput(),
      existingRequests: [
        { ...pendingRequest, buyerId: "other-buyer" },
        { ...pendingRequest, listingId: "other-listing" },
        pendingRequest,
      ],
    })).toMatchObject({ valid: false, status: 409, error: { code: "CONFLICT" } });
  });

  it("Không chặn yêu cầu PENDING của người khác trên cùng tin", () => {
    expect(validatePurchaseRequest({
      ...validInput(),
      existingRequests: [{ ...pendingRequest, buyerId: "other-buyer" }],
    })).toEqual({ valid: true });
  });

  it("Không chặn yêu cầu PENDING của cùng người mua trên tin khác", () => {
    expect(validatePurchaseRequest({
      ...validInput(),
      existingRequests: [{ ...pendingRequest, listingId: "other-listing" }],
    })).toEqual({ valid: true });
  });

  it.each([
    PURCHASE_REQUEST_STATUS.ACCEPTED,
    PURCHASE_REQUEST_STATUS.REJECTED,
    PURCHASE_REQUEST_STATUS.CANCELLED,
  ])("Yêu cầu cũ %s không chặn gửi mới nếu tin vẫn ACTIVE", (status) => {
    expect(validatePurchaseRequest({
      ...validInput(),
      existingRequests: [{ ...pendingRequest, status }],
    })).toEqual({ valid: true });
  });

  it.each([
    -1, 0.5, NaN, Infinity, -Infinity, 2_147_483_648,
    Number.MAX_SAFE_INTEGER + 1, "0", "5000000", "abc", null, undefined, true,
  ])("Chặn giá sai mà không tự ép thành 0: %s", (offeredPrice) => {
    expect(validatePurchaseRequest({ ...validInput(), offeredPrice }))
      .toMatchObject({ valid: false, status: 400, error: { code: "VALIDATION_ERROR" } });
  });
});

describe("Hủy yêu cầu mua — INV-PUR-05", () => {
  it("Cho phép chủ yêu cầu hủy PENDING theo chuyển trạng thái CANCELLED", () => {
    expect(validateCancelPurchaseRequest({ buyerId: pendingRequest.buyerId, request: pendingRequest }))
      .toEqual({ valid: true });
    // Validation không tự ghi trạng thái hay sửa bản ghi đầu vào.
    expect(pendingRequest.status).toBe(PURCHASE_REQUEST_STATUS.PENDING);
  });

  it.each([
    PURCHASE_REQUEST_STATUS.ACCEPTED,
    PURCHASE_REQUEST_STATUS.REJECTED,
    PURCHASE_REQUEST_STATUS.CANCELLED,
    "INVALID_STATUS",
  ])("Chặn hủy yêu cầu có trạng thái %s", (status) => {
    expect(validateCancelPurchaseRequest({
      buyerId: pendingRequest.buyerId,
      request: { ...pendingRequest, status },
    })).toMatchObject({ valid: false, status: 409, error: { code: "CONFLICT" } });
  });

  it("Chặn người khác hủy yêu cầu đang PENDING", () => {
    expect(validateCancelPurchaseRequest({ buyerId: "other-buyer", request: pendingRequest }))
      .toMatchObject({ valid: false, status: 403, error: { code: "FORBIDDEN" } });
  });

  it("Trả NOT_FOUND khi yêu cầu không tồn tại", () => {
    expect(validateCancelPurchaseRequest({ buyerId: pendingRequest.buyerId, request: null }))
      .toMatchObject({ valid: false, status: 404, error: { code: "NOT_FOUND" } });
  });
});
