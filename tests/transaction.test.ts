import { describe, expect, it } from "vitest";
import {
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@/lib/constants";
import {
  applyConfirmation,
  checkAcceptPurchaseRequest,
  checkCanActOnTransaction,
  checkRejectPurchaseRequest,
  getListingStatusOnComplete,
  hasAlreadyConfirmed,
} from "@/features/transaction/rules";

describe("Transaction rules (TV6)", () => {
  describe("checkAcceptPurchaseRequest", () => {
    const base = {
      actorId: "seller-1",
      listingSellerId: "seller-1",
      requestStatus: PURCHASE_REQUEST_STATUS.PENDING,
      listingStatus: LISTING_STATUS.ACTIVE,
    };

    it("cho phép khi đúng chủ tin, request PENDING, listing ACTIVE", () => {
      expect(checkAcceptPurchaseRequest(base)).toEqual({ ok: true });
    });

    it("trả 403 khi người gọi không phải chủ tin", () => {
      expect(
        checkAcceptPurchaseRequest({ ...base, actorId: "other" }),
      ).toMatchObject({ ok: false, code: "FORBIDDEN", status: 403 });
    });

    it("trả 409 khi request không còn PENDING", () => {
      expect(
        checkAcceptPurchaseRequest({
          ...base,
          requestStatus: PURCHASE_REQUEST_STATUS.CANCELLED,
        }),
      ).toMatchObject({ ok: false, code: "CONFLICT", status: 409 });
    });

    it("trả 409 khi listing đã IN_TRANSACTION (chống double-booking)", () => {
      expect(
        checkAcceptPurchaseRequest({
          ...base,
          listingStatus: LISTING_STATUS.IN_TRANSACTION,
        }),
      ).toMatchObject({ ok: false, code: "CONFLICT", status: 409 });
    });
  });

  describe("checkRejectPurchaseRequest", () => {
    it("cho phép chủ tin từ chối request PENDING", () => {
      expect(
        checkRejectPurchaseRequest({
          actorId: "seller-1",
          listingSellerId: "seller-1",
          requestStatus: PURCHASE_REQUEST_STATUS.PENDING,
        }),
      ).toEqual({ ok: true });
    });

    it("trả 409 khi request đã ACCEPTED", () => {
      expect(
        checkRejectPurchaseRequest({
          actorId: "seller-1",
          listingSellerId: "seller-1",
          requestStatus: PURCHASE_REQUEST_STATUS.ACCEPTED,
        }),
      ).toMatchObject({ ok: false, code: "CONFLICT", status: 409 });
    });
  });

  describe("checkCanActOnTransaction", () => {
    const base = {
      actorId: "buyer-1",
      buyerId: "buyer-1",
      sellerId: "seller-1",
      status: TRANSACTION_STATUS.IN_PROGRESS,
      type: TRANSACTION_TYPE.PURCHASE,
    };

    it("cho phép buyer khi giao dịch IN_PROGRESS loại PURCHASE", () => {
      expect(checkCanActOnTransaction(base)).toEqual({ ok: true });
    });

    it("trả 403 khi người gọi không thuộc giao dịch", () => {
      expect(
        checkCanActOnTransaction({ ...base, actorId: "stranger" }),
      ).toMatchObject({ ok: false, code: "FORBIDDEN", status: 403 });
    });

    it("trả 409 khi giao dịch đã COMPLETED", () => {
      expect(
        checkCanActOnTransaction({
          ...base,
          status: TRANSACTION_STATUS.COMPLETED,
        }),
      ).toMatchObject({ ok: false, code: "CONFLICT", status: 409 });
    });

    it("trả 409 khi là giao dịch EXCHANGE (Sprint 1 chưa hỗ trợ)", () => {
      expect(
        checkCanActOnTransaction({
          ...base,
          type: TRANSACTION_TYPE.EXCHANGE,
        }),
      ).toMatchObject({ ok: false, code: "CONFLICT", status: 409 });
    });
  });

  describe("applyConfirmation", () => {
    const ids = { buyerId: "buyer-1", sellerId: "seller-1" };

    it("chỉ bật cờ người mua, chưa đủ 2 cờ thì chưa hoàn tất", () => {
      expect(
        applyConfirmation({
          ...ids,
          actorId: "buyer-1",
          buyerConfirmed: false,
          sellerConfirmed: false,
        }),
      ).toEqual({ buyerConfirmed: true, sellerConfirmed: false, isReady: false });
    });

    it("hoàn tất khi bên kia đã xác nhận trước", () => {
      expect(
        applyConfirmation({
          ...ids,
          actorId: "seller-1",
          buyerConfirmed: true,
          sellerConfirmed: false,
        }),
      ).toEqual({ buyerConfirmed: true, sellerConfirmed: true, isReady: true });
    });

    it("bấm lặp không làm mất cờ đã có (idempotent)", () => {
      expect(
        applyConfirmation({
          ...ids,
          actorId: "buyer-1",
          buyerConfirmed: true,
          sellerConfirmed: false,
        }),
      ).toEqual({ buyerConfirmed: true, sellerConfirmed: false, isReady: false });
    });
  });

  describe("hasAlreadyConfirmed", () => {
    it("nhận biết người mua đã xác nhận", () => {
      expect(
        hasAlreadyConfirmed({
          actorId: "buyer-1",
          buyerId: "buyer-1",
          buyerConfirmed: true,
          sellerConfirmed: false,
        }),
      ).toBe(true);
    });

    it("người bán chưa xác nhận thì trả false", () => {
      expect(
        hasAlreadyConfirmed({
          actorId: "seller-1",
          buyerId: "buyer-1",
          buyerConfirmed: true,
          sellerConfirmed: false,
        }),
      ).toBe(false);
    });
  });

  describe("getListingStatusOnComplete", () => {
    it("PURCHASE chuyển listing sang SOLD", () => {
      expect(getListingStatusOnComplete(TRANSACTION_TYPE.PURCHASE)).toBe(
        LISTING_STATUS.SOLD,
      );
    });

    it("EXCHANGE chuyển listing sang EXCHANGED", () => {
      expect(getListingStatusOnComplete(TRANSACTION_TYPE.EXCHANGE)).toBe(
        LISTING_STATUS.EXCHANGED,
      );
    });
  });
});