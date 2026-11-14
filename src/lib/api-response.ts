/**
 * Chuẩn hoá response API cho TOÀN BỘ dự án.
 *
 * Mọi route handler trả về đúng 1 trong 2 dạng:
 *   Thành công: { "data": ... }
 *   Thất bại  : { "error": { "code": "...", "message": "..." } }
 *
 * CÁCH DÙNG:
 *   import { ok, fail, handleApiError } from "@/lib/api-response";
 *
 *   export async function GET() {
 *     try {
 *       const items = await prisma.category.findMany();
 *       return ok(items);
 *     } catch (e) {
 *       return handleApiError(e);
 *     }
 *   }
 *
 * Chủ sở hữu: TV2.
 */

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

/** Trả về thành công: { data } */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/** Trả về lỗi: { error: { code, message, details? } } */
export function fail(
  code: ApiErrorCode,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status },
  );
}

/**
 * Map lỗi (Prisma / Error thường) sang response chuẩn.
 * Dùng trong `catch` của mọi route handler.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return fail("CONFLICT", "Dữ liệu đã tồn tại (vi phạm ràng buộc unique).", 409);
    }
    if (error.code === "P2025") {
      return fail("NOT_FOUND", "Không tìm thấy bản ghi.", 404);
    }
    if (error.code === "P2003") {
      return fail("CONFLICT", "Bản ghi liên quan không tồn tại (khóa ngoại).", 409);
    }
  }

  if (error instanceof Error && error.message.includes("không hợp lệ")) {
    return fail("VALIDATION_ERROR", error.message, 400);
  }

  console.error("[API_INTERNAL_ERROR]", error);
  return fail("INTERNAL_ERROR", "Đã có lỗi xảy ra, vui lòng thử lại.", 500);
}

/** Đọc tham số phân trang an toàn từ query string. */
export function getPagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawLimit = Number(searchParams.get("limit") ?? "20");

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limitRaw =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 20;
  const limit = Math.min(limitRaw, 100); // chặn client kéo cả DB

  return { page, limit, skip: (page - 1) * limit };
}
