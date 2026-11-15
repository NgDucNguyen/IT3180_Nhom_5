import { getCatalogCategories } from "@/features/catalog";
import { fail, handleApiError, ok } from "@/lib/api-response";

/**
 * GET /api/categories
 * Lấy danh sách danh mục thiết bị (công khai, không cần đăng nhập).
 *
 * Response 200: { "data": [{ id, name, slug, description, icon, listingCount }] }
 * Response 500: { "error": { code, message } }
 *
 * Sở hữu: TV2
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCatalogCategories();
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Các thao tác ghi (POST/PUT/DELETE) thuộc về module Admin (TV8).
 * Trả 405 để AI không tự thêm endpoint vào file của người khác.
 */
export function POST() {
  return fail(
    "FORBIDDEN",
    "Tạo danh mục là chức năng Admin (TV8). Endpoint này chỉ hỗ trợ GET.",
    405,
  );
}
