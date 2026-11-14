import { describe, expect, it } from "vitest";
import { GET as getBrands } from "@/app/api/brands/route";
import { GET as getCategories } from "@/app/api/categories/route";

/**
 * SMOKE TEST cho 2 API nền của TV2.
 *
 * Test này gọi thẳng route handler (không cần HTTP server) và kiểm tra:
 *  - Mã trạng thái 200
 *  - Đúng format response chuẩn { data: [...] }
 *  - Dữ liệu seed đã được nạp
 *
 * Yêu cầu: đã chạy `npx prisma db push` + `npx prisma db seed`.
 * Owner: TV2
 */
describe("GET /api/categories", () => {
  it("trả 200 và đúng format { data }", async () => {
    const response = await getCategories();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.error).toBeUndefined();
  });

  it("có đủ 5 danh mục seed theo thứ tự tên", async () => {
    const body = await (await getCategories()).json();
    const names = body.data.map((c: { name: string }) => c.name);

    expect(names).toHaveLength(5);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("mỗi danh mục có listingCount là số", async () => {
    const body = await (await getCategories()).json();
    for (const category of body.data) {
      expect(typeof category.listingCount).toBe("number");
      expect(category.listingCount).toBeGreaterThanOrEqual(0);
      expect(category).not.toHaveProperty("_count");
    }
  });
});

describe("GET /api/brands", () => {
  it("trả 200, đúng format và có 6 thương hiệu seed", async () => {
    const response = await getBrands();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveLength(6);

    const names = body.data.map((b: { name: string }) => b.name);
    expect(names).toContain("Apple");
    expect(names).toContain("Samsung");
    expect(names).toContain("Sony");
  });
});
