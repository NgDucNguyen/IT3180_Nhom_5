import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { CONDITION, LISTING_STATUS, LISTING_STATUS_VALUES, ROLES, USER_STATUS, type ListingStatus } from "@/lib/constants";
import { POST as create, GET as list } from "@/app/api/listings/route";
import { PATCH as edit } from "@/app/api/listings/[id]/route";
import { PATCH as hide } from "@/app/api/listings/[id]/hide/route";
import type { ListingInput, SellerListing, SellerListingsResult } from "@/features/listing/types";

const suffix = randomUUID();
const previousSecret = process.env.JWT_SECRET;
const userIds: string[] = [];
let ownerId: string;
let otherId: string;
let catalogId: string;
let brandId: string;
let listOwnerId: string;
let input: ListingInput;

function cookie(userId: string) {
  return `${AUTH_COOKIE_NAME}=${createSessionToken(userId)}`;
}

function request(path = "", method = "GET", body?: unknown, session?: string, extraHeaders?: Record<string, string>) {
  return new NextRequest(`http://localhost:3000/api/listings${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(session ? { Cookie: session } : {}), ...extraHeaders },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function fixture(status: ListingStatus = LISTING_STATUS.ACTIVE) {
  return prisma.listing.create({
    data: { ...input, sellerId: ownerId, status },
    select: { id: true, title: true, status: true },
  });
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  const body: { error: { code: string; message: string } } = await response.json();
  expect(body.error.code).toBe(code);
  expect(body.error.message).toBeTruthy();
  expect(response.headers.get("cache-control")).toBe("no-store");
}

beforeAll(async () => {
  process.env.JWT_SECRET = randomUUID() + randomUUID();
  for (const label of ["owner", "other", "list-owner"]) {
    const user = await prisma.user.create({
      data: { email: `tv3-${label}-${suffix}@example.test`, fullName: `TV3 ${label}`,
        passwordHash: "fixture-not-used-for-login", role: ROLES.SELLER, status: USER_STATUS.ACTIVE },
      select: { id: true },
    });
    userIds.push(user.id);
  }
  [ownerId, otherId, listOwnerId] = userIds;
  catalogId = (await prisma.category.create({
    data: { name: "Danh mục kiểm thử TV3", slug: `tv3-category-${suffix}` }, select: { id: true },
  })).id;
  brandId = (await prisma.brand.create({
    data: { name: "Thương hiệu kiểm thử TV3", slug: `tv3-brand-${suffix}` }, select: { id: true },
  })).id;
  input = {
    title: "Laptop kiểm thử TV3", description: "Thiết bị hoạt động tốt, đầy đủ phụ kiện.",
    price: 8_500_000, condition: CONDITION.GOOD, categoryId: catalogId, brandId,
    specsJson: JSON.stringify({ cpu: "Intel i5", ram: "16 GB", warranty: "6 tháng" }),
    imagesJson: JSON.stringify(["/images/placeholder-device.svg", "https://example.test/device.jpg"]),
    allowExchange: true, exchangePreference: "Muốn đổi máy tính bảng",
  };
  for (const [index, status] of LISTING_STATUS_VALUES.entries()) {
    await prisma.listing.create({
      data: { ...input, title: `Tin riêng ${status}`, sellerId: listOwnerId, status,
        createdAt: new Date(Date.UTC(2026, 0, index + 1)) }, select: { id: true },
    });
  }
}, 20_000);

afterAll(async () => {
  // Chỉ dọn fixture TV3; không đụng dữ liệu seed hoặc dữ liệu thành viên khác.
  await prisma.listing.deleteMany({ where: { sellerId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  if (catalogId) await prisma.category.delete({ where: { id: catalogId }, select: { id: true } });
  if (brandId) await prisma.brand.delete({ where: { id: brandId }, select: { id: true } });
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

describe.sequential("TV3 — Tạo tin đăng", () => {
  it("tạo tin hợp lệ trả 201/PENDING, trim dữ liệu và không lộ mật khẩu", async () => {
    const response = await create(request("", "POST", { ...input, title: `  ${input.title}  ` }, cookie(ownerId)));
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body: { data: SellerListing } = await response.json();
    expect(body.data).toMatchObject({ ...input, sellerId: ownerId, status: LISTING_STATUS.PENDING });
    expect(body.data.category).toEqual({ id: catalogId, name: "Danh mục kiểm thử TV3" });
    expect(body.data.brand?.id).toBe(brandId);
    expect(body.data).not.toHaveProperty("seller");
    expect(JSON.stringify(body)).not.toContain("passwordHash");
    const stored = await prisma.listing.findUniqueOrThrow({ where: { id: body.data.id }, select: { status: true, sellerId: true } });
    expect(stored).toEqual({ status: LISTING_STATUS.PENDING, sellerId: ownerId });
  });

  it("không nhận sellerId/status do client tự gán", async () => {
    const response = await create(request("", "POST", { ...input, sellerId: otherId, status: LISTING_STATUS.ACTIVE }, cookie(ownerId)));
    expect(response.status).toBe(201);
    expect((await response.json()).data).toMatchObject({ sellerId: ownerId, status: LISTING_STATUS.PENDING });
  });

  it("hỗ trợ trường tùy chọn bỏ trống và xóa ghi chú khi không nhận trao đổi", async () => {
    const { brandId: _brand, specsJson: _specs, imagesJson: _images, ...required } = input;
    const response = await create(request("", "POST", { ...required, allowExchange: false }, cookie(ownerId)));
    expect(response.status).toBe(201);
    expect((await response.json()).data).toMatchObject({ brandId: null, specsJson: null, imagesJson: null,
      allowExchange: false, exchangePreference: null });
  });

  it.each([0, -1, 0.5, 2_147_483_648, "8500000", null])("giá không hợp lệ %j trả 400", async (price) => {
    await expectError(await create(request("", "POST", { ...input, price }, cookie(ownerId))), 400, "VALIDATION_ERROR");
  });

  it.each([
    { title: "abcd" }, { title: "a".repeat(121) }, { title: 12345 },
    { description: "quá ngắn" }, { description: null }, { condition: "BROKEN" },
    { categoryId: "" }, { categoryId: "khong-ton-tai" }, { brandId: "khong-ton-tai" },
    { brandId: 123 }, { specsJson: "{" }, { specsJson: "[]" }, { specsJson: "null" },
    { specsJson: '{"nested":{}}' }, { specsJson: { ram: "8 GB" } },
    { imagesJson: "{}" }, { imagesJson: '["javascript:alert(1)"]' },
    { imagesJson: '["//example.test/device.jpg"]' }, { imagesJson: "[123]" },
    { imagesJson: '["https://example.test/\\nimage.jpg"]' },
    { allowExchange: "true" }, { allowExchange: null }, { exchangePreference: 123 },
  ])("chặn dữ liệu sai và tham chiếu catalog sai: %j", async (changes) => {
    const before = await prisma.listing.count({ where: { sellerId: ownerId } });
    await expectError(await create(request("", "POST", { ...input, ...changes }, cookie(ownerId))), 400, "VALIDATION_ERROR");
    expect(await prisma.listing.count({ where: { sellerId: ownerId } })).toBe(before);
  });

  it.each([null, [], "payload"])("chặn body không phải object: %j", async (body) => {
    await expectError(await create(request("", "POST", body, cookie(ownerId))), 400, "VALIDATION_ERROR");
  });

  it("JSON hỏng trả 400", async () => {
    const bad = new NextRequest("http://localhost:3000/api/listings", {
      method: "POST", headers: { Cookie: cookie(ownerId), "Content-Type": "application/json" }, body: "{",
    });
    await expectError(await create(bad), 400, "VALIDATION_ERROR");
  });
});

describe.sequential("TV3 — Phiên và quyền sở hữu", () => {
  it("guest hoặc phiên hỏng không được tạo/xem/sửa/ẩn tin", async () => {
    const row = await fixture();
    for (const session of [undefined, `${AUTH_COOKIE_NAME}=invalid-token`]) {
      await expectError(await create(request("", "POST", input, session)), 401, "UNAUTHENTICATED");
      await expectError(await list(request("?mine=true", "GET", undefined, session)), 401, "UNAUTHENTICATED");
      await expectError(await edit(request(`/${row.id}`, "PATCH", { price: 1 }, session), context(row.id)), 401, "UNAUTHENTICATED");
      await expectError(await hide(request(`/${row.id}/hide`, "PATCH", undefined, session), context(row.id)), 401, "UNAUTHENTICATED");
    }
  });

  it("sellerId trên query không thể đọc tin riêng của người khác", async () => {
    await expectError(await list(request(`?mine=true&sellerId=${otherId}`, "GET", undefined, cookie(ownerId))), 403, "FORBIDDEN");
  });

  it("người khác không thể sửa hoặc ẩn tin", async () => {
    const row = await fixture();
    await expectError(await edit(request(`/${row.id}`, "PATCH", { price: 1 }, cookie(otherId)), context(row.id)), 403, "FORBIDDEN");
    await expectError(await hide(request(`/${row.id}/hide`, "PATCH", undefined, cookie(otherId)), context(row.id)), 403, "FORBIDDEN");
    expect(await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { price: true, status: true } }))
      .toEqual({ price: input.price, status: LISTING_STATUS.ACTIVE });
  });

  it("phiên đã cấp của tài khoản bị khóa bị chặn", async () => {
    const session = cookie(otherId);
    await prisma.user.update({ where: { id: otherId }, data: { status: USER_STATUS.LOCKED }, select: { id: true } });
    try {
      await expectError(await create(request("", "POST", input, session)), 403, "FORBIDDEN");
      await expectError(await list(request("?mine=true", "GET", undefined, session)), 403, "FORBIDDEN");
    } finally {
      await prisma.user.update({ where: { id: otherId }, data: { status: USER_STATUS.ACTIVE }, select: { id: true } });
    }
  });

  it("chặn request ghi từ origin khác", async () => {
    const row = await fixture();
    const headers = { Origin: "https://foreign.example", "sec-fetch-site": "cross-site" };
    await expectError(await create(request("", "POST", input, cookie(ownerId), headers)), 403, "FORBIDDEN");
    await expectError(await edit(request(`/${row.id}`, "PATCH", { price: 1 }, cookie(ownerId), headers), context(row.id)), 403, "FORBIDDEN");
    await expectError(await hide(request(`/${row.id}/hide`, "PATCH", undefined, cookie(ownerId), headers), context(row.id)), 403, "FORBIDDEN");
  });

  it("tin không tồn tại trả 404", async () => {
    const id = `missing-${suffix}`;
    await expectError(await edit(request(`/${id}`, "PATCH", { price: 1 }, cookie(ownerId)), context(id)), 404, "NOT_FOUND");
    await expectError(await hide(request(`/${id}/hide`, "PATCH", undefined, cookie(ownerId)), context(id)), 404, "NOT_FOUND");
  });
});

describe.sequential("TV3 — Danh sách tin của tôi", () => {
  it("trả đủ bảy trạng thái, chỉ tin của phiên, mới nhất trước", async () => {
    const response = await list(request(`?mine=true&sellerId=${listOwnerId}`, "GET", undefined, cookie(listOwnerId)));
    expect(response.status).toBe(200);
    const { data }: { data: SellerListingsResult } = await response.json();
    expect(data).toMatchObject({ total: LISTING_STATUS_VALUES.length, page: 1, limit: 20 });
    expect(data.items.every((item) => item.sellerId === listOwnerId)).toBe(true);
    expect(data.items.map((item) => item.status).sort()).toEqual([...LISTING_STATUS_VALUES].sort());
    expect(data.items.map((item) => item.createdAt)).toEqual(data.items.map((item) => item.createdAt).sort().reverse());
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.stringify(data)).not.toContain("passwordHash");
  });

  it("phân trang không trùng kết quả và lọc đúng trạng thái", async () => {
    const page1: { data: SellerListingsResult } = await (await list(request("?mine=true&limit=2", "GET", undefined, cookie(listOwnerId)))).json();
    const page2: { data: SellerListingsResult } = await (await list(request("?mine=true&limit=2&page=2", "GET", undefined, cookie(listOwnerId)))).json();
    expect(page1.data.items).toHaveLength(2);
    expect(page2.data).toMatchObject({ page: 2, limit: 2, total: 7 });
    expect(page2.data.items.every((item) => !page1.data.items.some((first) => first.id === item.id))).toBe(true);
    const filtered = await list(request(`?mine=true&status=${LISTING_STATUS.PENDING}`, "GET", undefined, cookie(listOwnerId)));
    expect((await filtered.json()).data).toMatchObject({ total: 1, items: [{ status: LISTING_STATUS.PENDING }] });
  });

  it("chuẩn hóa phân trang sai và giới hạn limit 100", async () => {
    const response = await list(request("?mine=true&page=-1&limit=1000", "GET", undefined, cookie(listOwnerId)));
    expect((await response.json()).data).toMatchObject({ page: 1, limit: 100 });
    const fractional = await list(request("?mine=true&page=0.5&limit=0.5", "GET", undefined, cookie(listOwnerId)));
    expect((await fractional.json()).data).toMatchObject({ page: 1, limit: 1 });
  });

  it.each(["", "?mine=false", "?mine=true&status=INVALID", "?mine=true&page=1e30"])("query sai trả 400: %s", async (query) => {
    await expectError(await list(request(query, "GET", undefined, cookie(ownerId))), 400, "VALIDATION_ERROR");
  });

  it("user chưa có tin trả danh sách rỗng", async () => {
    const response = await list(request("?mine=true", "GET", undefined, cookie(otherId)));
    expect((await response.json()).data).toMatchObject({ items: [], total: 0, page: 1, limit: 20 });
  });
});

describe.sequential("TV3 — Sửa tin và trạng thái duyệt", () => {
  it.each([LISTING_STATUS.ACTIVE, LISTING_STATUS.REJECTED])("sửa nội dung %s đưa về PENDING", async (status) => {
    const row = await fixture(status);
    const response = await edit(request(`/${row.id}`, "PATCH", { title: "Tiêu đề đã cập nhật" }, cookie(ownerId)), context(row.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ title: "Tiêu đề đã cập nhật", price: input.price,
      sellerId: ownerId, status: LISTING_STATUS.PENDING });
    expect((await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { status: true } })).status).toBe(LISTING_STATUS.PENDING);
  });

  it.each([LISTING_STATUS.PENDING, LISTING_STATUS.HIDDEN])("sửa từng phần tin %s giữ trạng thái theo đặc tả", async (status) => {
    const row = await fixture(status);
    const response = await edit(request(`/${row.id}`, "PATCH", { price: 9_000_000, brandId: null }, cookie(ownerId)), context(row.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ price: 9_000_000, brandId: null, title: input.title, status });
  });

  it("tắt nhận trao đổi xóa ghi chú, không tự đổi sellerId/status", async () => {
    const row = await fixture(LISTING_STATUS.PENDING);
    const response = await edit(request(`/${row.id}`, "PATCH", { allowExchange: false, sellerId: otherId,
      status: LISTING_STATUS.ACTIVE }, cookie(ownerId)), context(row.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ allowExchange: false, exchangePreference: null,
      sellerId: ownerId, status: LISTING_STATUS.PENDING });
  });

  it("lưu không đổi nội dung ACTIVE không gửi duyệt lại", async () => {
    const row = await fixture();
    const response = await edit(request(`/${row.id}`, "PATCH", { title: input.title }, cookie(ownerId)), context(row.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data.status).toBe(LISTING_STATUS.ACTIVE);
  });

  it.each([LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.SOLD, LISTING_STATUS.EXCHANGED])("chặn sửa trạng thái %s", async (status) => {
    const row = await fixture(status);
    await expectError(await edit(request(`/${row.id}`, "PATCH", { price: 1 }, cookie(ownerId)), context(row.id)), 409, "CONFLICT");
    expect(await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { price: true, status: true } }))
      .toEqual({ price: input.price, status });
  });

  it.each([{}, { status: LISTING_STATUS.ACTIVE }, { price: 0 }, { categoryId: "missing" }, { imagesJson: "{" }])(
    "patch sai không ghi thay đổi: %j", async (body) => {
      const row = await fixture();
      await expectError(await edit(request(`/${row.id}`, "PATCH", body, cookie(ownerId)), context(row.id)), 400, "VALIDATION_ERROR");
      expect((await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { status: true } })).status).toBe(LISTING_STATUS.ACTIVE);
    },
  );
});

describe.sequential("TV3 — Ẩn/Bỏ ẩn tin", () => {
  it("ẩn ACTIVE thành HIDDEN và bỏ ẩn thành ACTIVE", async () => {
    const row = await fixture();
    const hidden = await hide(request(`/${row.id}/hide`, "PATCH", undefined, cookie(ownerId)), context(row.id));
    expect(hidden.status).toBe(200);
    expect((await hidden.json()).data.status).toBe(LISTING_STATUS.HIDDEN);
    const shown = await hide(request(`/${row.id}/hide`, "PATCH", undefined, cookie(ownerId)), context(row.id));
    expect(shown.status).toBe(200);
    expect((await shown.json()).data.status).toBe(LISTING_STATUS.ACTIVE);
    expect((await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { status: true } })).status).toBe(LISTING_STATUS.ACTIVE);
  });

  it.each([LISTING_STATUS.PENDING, LISTING_STATUS.REJECTED, LISTING_STATUS.IN_TRANSACTION, LISTING_STATUS.SOLD, LISTING_STATUS.EXCHANGED])(
    "chặn ẩn tin %s bằng lỗi chuyển trạng thái 409", async (status) => {
      const row = await fixture(status);
      await expectError(await hide(request(`/${row.id}/hide`, "PATCH", undefined, cookie(ownerId)), context(row.id)), 409, "CONFLICT");
      expect((await prisma.listing.findUniqueOrThrow({ where: { id: row.id }, select: { status: true } })).status).toBe(status);
    },
  );
});
