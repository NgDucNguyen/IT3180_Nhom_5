import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { CONDITION, LISTING_STATUS, ROLES, USER_STATUS } from "@/lib/constants";
import {
  DELETE as clearCartRoute,
  GET as getCartRoute,
  POST as addToCartRoute,
} from "@/app/api/cart/route";
import { DELETE as removeCartItemRoute } from "@/app/api/cart/[listingId]/route";
import type { CartSummaryDTO } from "@/features/cart/types";

const suffix = randomUUID();
const previousSecret = process.env.JWT_SECRET;
const userIds: string[] = [];
let buyerId: string;
let sellerId: string;
let categoryId: string;
let activeListingId: string;
let secondActiveListingId: string;
let pendingListingId: string;
let ownListingId: string;

function sessionCookie(userId: string) {
  return `${AUTH_COOKIE_NAME}=${createSessionToken(userId)}`;
}

function makeRequest(
  path = "",
  method = "GET",
  body?: unknown,
  cookie?: string,
  extraHeaders?: Record<string, string>,
) {
  return new NextRequest(`http://localhost:3000/api/cart${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  const body = (await response.json()) as {
    error: { code: string; message: string };
  };
  expect(body.error.code).toBe(code);
  expect(body.error.message).toBeTruthy();
  expect(response.headers.get("cache-control")).toBe("no-store");
}

beforeAll(async () => {
  process.env.JWT_SECRET = randomUUID() + randomUUID();

  for (const label of ["buyer", "seller"]) {
    const user = await prisma.user.create({
      data: {
        email: `cart-${label}-${suffix}@example.test`,
        fullName: `Cart ${label}`,
        passwordHash: "fixture-not-used-for-login",
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE,
      },
      select: { id: true },
    });
    userIds.push(user.id);
  }
  [buyerId, sellerId] = userIds;

  categoryId = (
    await prisma.category.create({
      data: {
        name: "Danh mục kiểm thử Cart",
        slug: `cart-category-${suffix}`,
      },
      select: { id: true },
    })
  ).id;

  activeListingId = (
    await prisma.listing.create({
      data: {
        title: "MacBook Pro kiểm thử giỏ hàng",
        description: "Máy hoạt động ổn định.",
        price: 15_000_000,
        condition: CONDITION.LIKE_NEW,
        categoryId,
        sellerId,
        status: LISTING_STATUS.ACTIVE,
      },
      select: { id: true },
    })
  ).id;

  secondActiveListingId = (
    await prisma.listing.create({
      data: {
        title: "iPad Air kiểm thử giỏ hàng",
        description: "Đủ hộp phụ kiện.",
        price: 11_000_000,
        condition: CONDITION.GOOD,
        categoryId,
        sellerId,
        status: LISTING_STATUS.ACTIVE,
      },
      select: { id: true },
    })
  ).id;

  pendingListingId = (
    await prisma.listing.create({
      data: {
        title: "Thiết bị đang chờ duyệt",
        description: "Chưa mở bán.",
        price: 5_000_000,
        condition: CONDITION.GOOD,
        categoryId,
        sellerId,
        status: LISTING_STATUS.PENDING,
      },
      select: { id: true },
    })
  ).id;

  ownListingId = (
    await prisma.listing.create({
      data: {
        title: "Thiết bị của chính người mua",
        description: "Tự đăng bán.",
        price: 7_000_000,
        condition: CONDITION.GOOD,
        categoryId,
        sellerId: buyerId,
        status: LISTING_STATUS.ACTIVE,
      },
      select: { id: true },
    })
  ).id;
}, 20_000);

afterAll(async () => {
  await prisma.cartItem.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.listing.deleteMany({ where: { sellerId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  if (categoryId) {
    await prisma.category.delete({
      where: { id: categoryId },
      select: { id: true },
    });
  }
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

describe("API Giỏ hàng (/api/cart)", () => {
  it("từ chối khi chưa đăng nhập (401 UNAUTHENTICATED)", async () => {
    await expectError(
      await getCartRoute(makeRequest()),
      401,
      "UNAUTHENTICATED",
    );
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: activeListingId }),
      ),
      401,
      "UNAUTHENTICATED",
    );
  });

  it("chặn request khác origin (403 FORBIDDEN)", async () => {
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: activeListingId }, sessionCookie(buyerId), {
          Origin: "https://evil.example",
        }),
      ),
      403,
      "FORBIDDEN",
    );
  });

  it("không cho tự thêm thiết bị của chính mình hoặc tin chưa ACTIVE", async () => {
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: ownListingId }, sessionCookie(buyerId)),
      ),
      403,
      "FORBIDDEN",
    );
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: pendingListingId }, sessionCookie(buyerId)),
      ),
      409,
      "CONFLICT",
    );
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: "khong-ton-tai" }, sessionCookie(buyerId)),
      ),
      404,
      "NOT_FOUND",
    );
  });

  it("thêm vào giỏ, tính tổng, chặn thêm trùng và xóa từng mục / xóa toàn bộ", async () => {
    const add1 = await addToCartRoute(
      makeRequest("", "POST", { listingId: activeListingId }, sessionCookie(buyerId)),
    );
    expect(add1.status).toBe(201);
    const add1Body = (await add1.json()) as {
      data: { totalCount: number; item: { listingId: string } };
    };
    expect(add1Body.data.item.listingId).toBe(activeListingId);
    expect(add1Body.data.totalCount).toBe(1);

    // Chặn thêm trùng cùng thiết bị
    await expectError(
      await addToCartRoute(
        makeRequest("", "POST", { listingId: activeListingId }, sessionCookie(buyerId)),
      ),
      409,
      "CONFLICT",
    );

    const add2 = await addToCartRoute(
      makeRequest(
        "",
        "POST",
        { listingId: secondActiveListingId },
        sessionCookie(buyerId),
      ),
    );
    expect(add2.status).toBe(201);

    const listRes = await getCartRoute(
      makeRequest("", "GET", undefined, sessionCookie(buyerId)),
    );
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as { data: CartSummaryDTO };
    expect(listBody.data.totalCount).toBe(2);
    expect(listBody.data.availableCount).toBe(2);
    expect(listBody.data.totalAmount).toBe(26_000_000);
    // Không bao giờ rò rỉ passwordHash
    expect(JSON.stringify(listBody)).not.toContain("passwordHash");

    // Xóa 1 thiết bị theo listingId
    const removeRes = await removeCartItemRoute(
      makeRequest(`/${activeListingId}`, "DELETE", undefined, sessionCookie(buyerId)),
      { params: Promise.resolve({ listingId: activeListingId }) },
    );
    expect(removeRes.status).toBe(200);
    const removeBody = (await removeRes.json()) as {
      data: { listingId: string; totalCount: number };
    };
    expect(removeBody.data.totalCount).toBe(1);

    // Xóa tiếp mục không còn trong giỏ -> 404
    await expectError(
      await removeCartItemRoute(
        makeRequest(`/${activeListingId}`, "DELETE", undefined, sessionCookie(buyerId)),
        { params: Promise.resolve({ listingId: activeListingId }) },
      ),
      404,
      "NOT_FOUND",
    );

    // Xóa toàn bộ giỏ hàng
    const clearRes = await clearCartRoute(
      makeRequest("", "DELETE", undefined, sessionCookie(buyerId)),
    );
    expect(clearRes.status).toBe(200);
    const clearBody = (await clearRes.json()) as {
      data: { deletedCount: number; totalCount: number };
    };
    expect(clearBody.data.deletedCount).toBe(1);
    expect(clearBody.data.totalCount).toBe(0);
  });
});
