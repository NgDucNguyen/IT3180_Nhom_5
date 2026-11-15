import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";

/** Lỗi nghiệp vụ của phân hệ Shop / Kênh người bán. */
export class ShopError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function shopErrorResponse(error: unknown) {
  const response =
    error instanceof ShopError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
