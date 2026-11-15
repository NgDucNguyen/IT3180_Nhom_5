import { describe, expect, it } from "vitest";
import {
  LISTING_STATUS,
  LISTING_STATUS_VALUES,
} from "@/lib/constants";
import {
  validateCreateExchangeOffer,
  type CreateExchangeOfferInput,
} from "@/features/exchange/validation";

function createValidInput(): CreateExchangeOfferInput {
  return {
    proposerId: "user-b",
    targetListing: {
      id: "listing-x",
      sellerId: "user-a",
      status: LISTING_STATUS.ACTIVE,
      allowExchange: true,
    },
    offeredListing: {
      id: "listing-y",
      sellerId: "user-b",
      status: LISTING_STATUS.ACTIVE,
      allowExchange: false,
    },
    cashTopUp: 0,
    hasPendingOffer: false,
  };
}

describe("Validate điều kiện gửi đề nghị trao đổi", () => {
  it.each([0, 500_000, 2_147_483_647])(
    "Chấp nhận đề nghị hợp lệ với tiền bù %s VND",
    (cashTopUp) => {
      const input = createValidInput();
      input.cashTopUp = cashTopUp;

      expect(validateCreateExchangeOffer(input)).toEqual({
        valid: true,
      });
    },
  );

  it("Chặn dùng cùng một tin đăng cho cả hai thiết bị", () => {
    const input = createValidInput();
    input.offeredListing.id = input.targetListing.id;

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "VALIDATION_ERROR",
    });
  });

  it("Chặn đề nghị trao đổi tin của chính mình", () => {
    const input = createValidInput();
    input.targetListing.sellerId = input.proposerId;

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "FORBIDDEN",
    });
  });

  it("Chặn đem thiết bị của người khác đi trao đổi", () => {
    const input = createValidInput();
    input.offeredListing.sellerId = "user-c";

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "FORBIDDEN",
    });
  });

  const unavailableStatuses = LISTING_STATUS_VALUES.filter(
    (status) => status !== LISTING_STATUS.ACTIVE,
  );

  it.each(unavailableStatuses)(
    "Chặn khi thiết bị mục tiêu có trạng thái %s",
    (status) => {
      const input = createValidInput();
      input.targetListing.status = status;

      expect(validateCreateExchangeOffer(input)).toMatchObject({
        valid: false,
        code: "CONFLICT",
      });
    },
  );

  it.each(unavailableStatuses)(
    "Chặn khi thiết bị đem đổi có trạng thái %s",
    (status) => {
      const input = createValidInput();
      input.offeredListing.status = status;

      expect(validateCreateExchangeOffer(input)).toMatchObject({
        valid: false,
        code: "CONFLICT",
      });
    },
  );

  it("Chặn khi tin mục tiêu không nhận trao đổi", () => {
    const input = createValidInput();
    input.targetListing.allowExchange = false;

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "CONFLICT",
    });
  });

  it("Không bắt buộc thiết bị đem đổi bật nhận trao đổi", () => {
    const input = createValidInput();
    input.offeredListing.allowExchange = false;

    expect(validateCreateExchangeOffer(input)).toEqual({
      valid: true,
    });
  });

  it("Chặn đề nghị PENDING trùng cặp thiết bị", () => {
    const input = createValidInput();
    input.hasPendingOffer = true;

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "CONFLICT",
    });
  });

  it.each([
    -1,
    0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    2_147_483_648,
  ])("Chặn tiền bù không hợp lệ: %s", (cashTopUp) => {
    const input = createValidInput();
    input.cashTopUp = cashTopUp;

    expect(validateCreateExchangeOffer(input)).toMatchObject({
      valid: false,
      code: "VALIDATION_ERROR",
    });
  });

  it("Không thay đổi dữ liệu khi validate đề nghị hợp lệ", () => {
    const input = createValidInput();
    const originalInput = structuredClone(input);

    validateCreateExchangeOffer(input);

    expect(input).toEqual(originalInput);
  });

  it("Không thay đổi dữ liệu khi validate đề nghị không hợp lệ", () => {
    const input = createValidInput();
    input.hasPendingOffer = true;
    const originalInput = structuredClone(input);

    validateCreateExchangeOffer(input);

    expect(input).toEqual(originalInput);
  });
});