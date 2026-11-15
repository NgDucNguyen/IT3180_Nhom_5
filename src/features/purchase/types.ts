import type { ApiErrorCode } from "@/lib/api-response";

export interface PurchaseListingSnapshot {
  id: string;
  sellerId: string;
  status: string;
}

export interface PurchaseRequestSnapshot {
  listingId: string;
  buyerId: string;
  status: string;
}

export interface PurchaseRequestValidationInput {
  buyerId: string;
  offeredPrice: unknown;
  listing: PurchaseListingSnapshot | null;
  existingRequests: readonly PurchaseRequestSnapshot[];
}

export interface CancelPurchaseRequestValidationInput {
  buyerId: string;
  request: PurchaseRequestSnapshot | null;
}

export type PurchaseValidationResult =
  | { valid: true }
  | {
      valid: false;
      status: 400 | 403 | 404 | 409;
      error: {
        code: Extract<ApiErrorCode, "VALIDATION_ERROR" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT">;
        message: string;
      };
    };
