import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";

/** Lỗi nghiệp vụ của phân hệ Giỏ hàng. */
export class CartError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Chuẩn hóa error response với Cache-Control: no-store cho mọi API Cart. */
export function cartErrorResponse(error: unknown) {
  const response =
    error instanceof CartError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
