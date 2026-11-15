import { describe, expect, it } from "vitest";
import { GET as getBrands, POST as postBrands } from "@/app/api/brands/route";
import {
  GET as getCategories,
  POST as postCategories,
} from "@/app/api/categories/route";
import { getBrandBySlug, getCategoryBySlug } from "@/features/catalog";

/**
 * SMOKE TEST cho 2 API nền và catalog service của TV2.
 *
 * Test này gọi thẳng route handler (không cần HTTP server) và kiểm tra:
 *  - Mã trạng thái 200 (GET) và 405 (POST)
 *  - Đúng format response chuẩn { data: [...] }
 *  - Dữ liệu seed đã được nạp và sắp xếp theo chuẩn tiếng Việt ("vi")
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

  it("có đủ danh mục seed theo thứ tự tiếng Việt", async () => {
    const body = await (await getCategories()).json();
    const names = body.data.map((c: { name: string }) => c.name);

    expect(names.length).toBeGreaterThanOrEqual(5);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "vi")));
  });

  it("mỗi danh mục có listingCount là số", async () => {
    const body = await (await getCategories()).json();
    for (const category of body.data) {
      expect(typeof category.listingCount).toBe("number");
      expect(category.listingCount).toBeGreaterThanOrEqual(0);
      expect(category).not.toHaveProperty("_count");
    }
  });

  it("POST /api/categories trả 405 FORBIDDEN", async () => {
    const response = postCategories();
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error?.code).toBe("FORBIDDEN");
  });
});

describe("GET /api/brands", () => {
  it("trả 200, đúng format và có các thương hiệu seed", async () => {
    const response = await getBrands();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.length).toBeGreaterThanOrEqual(6);

    const names = body.data.map((b: { name: string }) => b.name);
    expect(names).toContain("Apple");
    expect(names).toContain("Samsung");
    expect(names).toContain("Sony");
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "vi")));
  });

  it("POST /api/brands trả 405 FORBIDDEN", async () => {
    const response = postBrands();
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.error?.code).toBe("FORBIDDEN");
  });
});

describe("Catalog queries (getCategoryBySlug / getBrandBySlug)", () => {
  it("lấy đúng danh mục theo slug và trả null khi không tồn tại", async () => {
    const phoneCategory = await getCategoryBySlug("dien-thoai");
    expect(phoneCategory).not.toBeNull();
    expect(phoneCategory?.name).toBe("Điện thoại");
    expect(phoneCategory?.activeListingCount).toBeGreaterThanOrEqual(0);

    const unknownCategory = await getCategoryBySlug("khong-ton-tai");
    expect(unknownCategory).toBeNull();
  });

  it("lấy đúng thương hiệu theo slug và trả null khi không tồn tại", async () => {
    const appleBrand = await getBrandBySlug("apple");
    expect(appleBrand).not.toBeNull();
    expect(appleBrand?.name).toBe("Apple");

    const unknownBrand = await getBrandBySlug("khong-ton-tai");
    expect(unknownBrand).toBeNull();
  });
});
