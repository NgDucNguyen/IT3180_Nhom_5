import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";

export class PurchaseError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function purchaseErrorResponse(error: unknown) {
  const response =
    error instanceof PurchaseError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
