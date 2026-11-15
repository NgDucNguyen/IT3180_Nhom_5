import { getCatalogBrands } from "@/features/catalog";
import { fail, handleApiError, ok } from "@/lib/api-response";

/**
 * GET /api/brands
 * Lấy danh sách thương hiệu (công khai, không cần đăng nhập).
 *
 * Response 200: { "data": [{ id, name, slug, logoUrl, listingCount }] }
 * Response 500: { "error": { code, message } }
 *
 * Sở hữu: TV2
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCatalogBrands();
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Thao tác ghi thuộc module Admin (TV8). */
export function POST() {
  return fail(
    "FORBIDDEN",
    "Tạo thương hiệu là chức năng Admin (TV8). Endpoint này chỉ hỗ trợ GET.",
    405,
  );
}
