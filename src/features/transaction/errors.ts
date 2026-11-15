import type { ApiErrorCode } from "@/lib/api-response";

// Lỗi nghiệp vụ của module Transaction.
// Ném bên trong $transaction để Prisma rollback; route sẽ bắt và đổi thành response chuẩn.
export class TransactionError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "TransactionError";
    this.code = code;
    this.status = status;
  }
}

export const notFoundError = (message: string) =>
  new TransactionError("NOT_FOUND", message, 404);

export const forbiddenError = (message: string) =>
  new TransactionError("FORBIDDEN", message, 403);

export const conflictError = (message: string) =>
  new TransactionError("CONFLICT", message, 409);