import { authErrorResponse } from "@/features/auth/errors";
import { fail, ok, type ApiErrorCode } from "@/lib/api-response";

export class ListingError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function listingErrorResponse(error: unknown) {
  const response = error instanceof ListingError
    ? fail(error.code, error.message, error.status)
    : authErrorResponse(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function listingResponse<T>(data: T, status = 200) {
  const response = ok(data, status);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
