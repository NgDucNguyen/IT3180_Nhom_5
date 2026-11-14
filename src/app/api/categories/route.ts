import { fail, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/categories
 * Lấy danh sách danh mục thiết bị (công khai, không cần đăng nhập).
 *
 * Response 200: { "data": [{ id, name, slug, description, icon }] }
 * Response 500: { "error": { code, message } }
 *
 * Sở hữu: TV2
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        _count: { select: { listings: true } },
      },
    });

    // Sắp xếp theo collation tiếng Việt (Đ đứng cạnh D).
    // SQLite sắp theo byte nên "Điện thoại" sẽ bị đẩy xuống cuối -> sort ở đây.
    const data = categories
      .map(({ _count, ...category }) => ({
        ...category,
        listingCount: _count.listings,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));

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
