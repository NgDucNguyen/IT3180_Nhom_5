import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PATCH as approveListing } from "@/app/api/admin/listings/[id]/approve/route";
import { PATCH as verifyShop } from "@/app/api/admin/shops/[id]/verify/route";
import { POST as addToCartRoute } from "@/app/api/cart/route";
import { POST as createListing } from "@/app/api/listings/route";
import { POST as acceptPurchase } from "@/app/api/purchase-requests/[id]/accept/route";
import { POST as createPurchaseRequest } from "@/app/api/purchase-requests/route";
import { PATCH as resolveReport } from "@/app/api/reports/[id]/route";
import { POST as createReport } from "@/app/api/reports/route";
import { GET as getMyShopRoute, PATCH as updateMyShopRoute } from "@/app/api/shop/me/route";
import { POST as upgradeShop } from "@/app/api/shop/upgrade/route";
import { PATCH as confirmTransaction } from "@/app/api/transactions/[id]/confirm/route";
import { getShopStorefront } from "@/features/shop/service";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import {
  CONDITION,
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  REPORT_STATUS,
  ROLES,
  TRANSACTION_STATUS,
  USER_STATUS,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const suffix = randomUUID();
const previousSecret = process.env.JWT_SECRET;

let buyerAId = "";
let buyerBId = "";
let adminId = "";
let categoryId = "";
let brandId = "";
let listingAId = "";
let shopASlug = "";
let shopAId = "";
let shopBId = "";
let purchaseRequestId = "";
let transactionId = "";
let reportId = "";

function cookieHeader(userId: string) {
  return `${AUTH_COOKIE_NAME}=${createSessionToken(userId)}`;
}

function makeRequest(
  path: string,
  method: string,
  userId?: string,
  body?: unknown,
) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
      ...(userId ? { Cookie: cookieHeader(userId) } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeAll(async () => {
  process.env.JWT_SECRET = randomUUID() + randomUUID();

  const [buyerA, buyerB, admin, category, brand] = await Promise.all([
    prisma.user.create({
      data: {
        email: `actor-a-${suffix}@example.test`,
        fullName: "Người Dùng A",
        passwordHash: "fixture-hash",
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE,
      },
      select: { id: true },
    }),
    prisma.user.create({
      data: {
        email: `actor-b-${suffix}@example.test`,
        fullName: "Người Dùng B",
        passwordHash: "fixture-hash",
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE,
      },
      select: { id: true },
    }),
    prisma.user.create({
      data: {
        email: `actor-admin-${suffix}@example.test`,
        fullName: "Admin Kiểm Thử",
        passwordHash: "fixture-hash",
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
      },
      select: { id: true },
    }),
    prisma.category.create({
      data: {
        name: `Danh mục 3-actor ${suffix.slice(0, 8)}`,
        slug: `cat-3a-${suffix}`,
      },
      select: { id: true },
    }),
    prisma.brand.create({
      data: {
        name: `Hãng 3-actor ${suffix.slice(0, 8)}`,
        slug: `brand-3a-${suffix}`,
      },
      select: { id: true },
    }),
  ]);

  buyerAId = buyerA.id;
  buyerBId = buyerB.id;
  adminId = admin.id;
  categoryId = category.id;
  brandId = brand.id;
}, 20_000);

afterAll(async () => {
  try {
    const userIds = [buyerAId, buyerBId, adminId].filter(Boolean);
    await prisma.transaction.deleteMany({
      where: {
        OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }],
      },
    });
    await prisma.report.deleteMany({
      where: { reporterId: { in: userIds } },
    });
    await prisma.cartItem.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.purchaseRequest.deleteMany({
      where: { buyerId: { in: userIds } },
    });
    await prisma.exchangeOffer.deleteMany({
      where: {
        OR: [{ proposerId: { in: userIds } }, { receiverId: { in: userIds } }],
      },
    });
    await prisma.listing.deleteMany({
      where: { sellerId: { in: userIds } },
    });
    await prisma.shop.deleteMany({
      where: { ownerId: { in: userIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
    if (brandId) {
      await prisma.brand.deleteMany({ where: { id: brandId } });
    }
  } finally {
    if (previousSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousSecret;
    }
  }
});

describe("Luồng 3 Actor: Người mua -> Mở Shop -> Đăng & Admin duyệt -> Seller vẫn đi mua", () => {
  it("1. Người mua thuần (USER) bị chặn 403 khi đăng tin trước khi mở Shop", async () => {
    const res = await createListing(
      makeRequest("/api/listings", "POST", buyerAId, {
        title: "MacBook Pro M3 14 inch",
        description: "Máy dùng kỹ, còn bảo hành dài.",
        price: 32_000_000,
        condition: CONDITION.LIKE_NEW,
        categoryId,
        brandId,
      }),
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("2. Người mua A nâng cấp lên Shop (USER -> SELLER) và không thể nâng cấp trùng 409", async () => {
    const upgradeRes = await upgradeShop(
      makeRequest("/api/shop/upgrade", "POST", buyerAId, {
        name: `Shop Công Nghệ A ${suffix.slice(0, 6)}`,
        city: "Hà Nội",
        tagline: "Chuyên MacBook & phụ kiện chuẩn zin",
        contactPhone: "0912345678",
        bannerTheme: "indigo",
      }),
    );

    expect(upgradeRes.status).toBe(201);
    const upgradeBody = (await upgradeRes.json()) as {
      data: {
        shop: { id: string; slug: string; bannerTheme: string };
        user: { role: string };
      };
    };
    expect(upgradeBody.data.user.role).toBe(ROLES.SELLER);
    expect(upgradeBody.data.shop.bannerTheme).toBe("indigo");
    shopAId = upgradeBody.data.shop.id;
    shopASlug = upgradeBody.data.shop.slug;

    // Gửi lần 2 -> 409 CONFLICT
    const dupRes = await upgradeShop(
      makeRequest("/api/shop/upgrade", "POST", buyerAId, {
        name: "Shop trùng lần 2",
        city: "TP.HCM",
      }),
    );
    expect(dupRes.status).toBe(409);
  });

  it("3. Chủ Shop A đăng tin (PENDING) và chỉ Admin mới duyệt được sang ACTIVE", async () => {
    const createRes = await createListing(
      makeRequest("/api/listings", "POST", buyerAId, {
        title: "ThinkPad X1 Carbon Gen 11",
        description: "Bàn phím gõ êm, màn hình IPS 2K sắc nét.",
        price: 24_500_000,
        condition: CONDITION.LIKE_NEW,
        categoryId,
        brandId,
        allowExchange: true,
        exchangePreference: "Đổi sang iPad Pro M2",
      }),
    );

    expect(createRes.status).toBe(201);
    const createdBody = (await createRes.json()) as {
      data: { id: string; status: string };
    };
    listingAId = createdBody.data.id;
    expect(createdBody.data.status).toBe(LISTING_STATUS.PENDING);

    // Người dùng thường / Chủ Shop tự duyệt -> 403 FORBIDDEN
    const nonAdminApprove = await approveListing(
      makeRequest(`/api/admin/listings/${listingAId}/approve`, "PATCH", buyerAId),
      ctx(listingAId),
    );
    expect(nonAdminApprove.status).toBe(403);

    // Admin duyệt tin -> 200 ACTIVE
    const adminApprove = await approveListing(
      makeRequest(`/api/admin/listings/${listingAId}/approve`, "PATCH", adminId),
      ctx(listingAId),
    );
    expect(adminApprove.status).toBe(200);
    const approvedBody = (await adminApprove.json()) as {
      data: { id: string; status: string };
    };
    expect(approvedBody.data.status).toBe(LISTING_STATUS.ACTIVE);

    // Admin gắn huy hiệu Shop Uy Tín cho Shop A
    const verifyRes = await verifyShop(
      makeRequest(`/api/admin/shops/${shopAId}/verify`, "PATCH", adminId, {
        isVerified: true,
      }),
      ctx(shopAId),
    );
    expect(verifyRes.status).toBe(200);
    const verifiedBody = (await verifyRes.json()) as {
      data: { isVerified: boolean };
    };
    expect(verifiedBody.data.isVerified).toBe(true);
  });

  it("4. Người B sau khi nâng cấp thành Chủ Shop vẫn giữ quyền bỏ giỏ hàng & mua máy từ Shop A", async () => {
    // B nâng cấp lên Shop B
    const upgradeBRes = await upgradeShop(
      makeRequest("/api/shop/upgrade", "POST", buyerBId, {
        name: `Shop Mobile B ${suffix.slice(0, 6)}`,
        city: "Đà Nẵng",
        bannerTheme: "emerald",
      }),
    );
    expect(upgradeBRes.status).toBe(201);
    const upgradeBBody = (await upgradeBRes.json()) as {
      data: { shop: { id: string }; user: { role: string } };
    };
    shopBId = upgradeBBody.data.shop.id;
    expect(upgradeBBody.data.user.role).toBe(ROLES.SELLER);
    expect(shopBId).not.toBe(shopAId);

    // Dù B đã là SELLER, B vẫn bỏ giỏ hàng & gửi yêu cầu mua máy của Shop A
    const cartRes = await addToCartRoute(
      makeRequest("/api/cart", "POST", buyerBId, { listingId: listingAId }),
    );
    expect(cartRes.status).toBe(201);

    const prRes = await createPurchaseRequest(
      makeRequest("/api/purchase-requests", "POST", buyerBId, {
        listingId: listingAId,
        offeredPrice: 24_000_000,
        message: "Shop B đặt mua cho khách",
      }),
    );
    expect(prRes.status).toBe(201);
    const prBody = (await prRes.json()) as {
      data: { id: string; status: string };
    };
    purchaseRequestId = prBody.data.id;
    expect(prBody.data.status).toBe(PURCHASE_REQUEST_STATUS.PENDING);
  });

  it("5. Hai bên xác nhận giao dịch 2 chiều -> SOLD & cập nhật thống kê trang Shop A", async () => {
    const acceptRes = await acceptPurchase(
      makeRequest(
        `/api/purchase-requests/${purchaseRequestId}/accept`,
        "POST",
        buyerAId,
      ),
      ctx(purchaseRequestId),
    );
    expect(acceptRes.status).toBe(201);
    const acceptBody = (await acceptRes.json()) as {
      data: { id: string; status: string };
    };
    transactionId = acceptBody.data.id;
    expect(acceptBody.data.status).toBe(TRANSACTION_STATUS.IN_PROGRESS);

    // Buyer B xác nhận trước
    const buyerConfirmRes = await confirmTransaction(
      makeRequest(`/api/transactions/${transactionId}/confirm`, "PATCH", buyerBId),
      ctx(transactionId),
    );
    expect(buyerConfirmRes.status).toBe(200);
    const buyerConfirmBody = (await buyerConfirmRes.json()) as {
      data: { status: string; buyerConfirmed: boolean; sellerConfirmed: boolean };
    };
    expect(buyerConfirmBody.data.buyerConfirmed).toBe(true);
    expect(buyerConfirmBody.data.sellerConfirmed).toBe(false);
    expect(buyerConfirmBody.data.status).toBe(TRANSACTION_STATUS.IN_PROGRESS);

    // Seller A xác nhận -> COMPLETED & Listing -> SOLD
    const sellerConfirmRes = await confirmTransaction(
      makeRequest(`/api/transactions/${transactionId}/confirm`, "PATCH", buyerAId),
      ctx(transactionId),
    );
    expect(sellerConfirmRes.status).toBe(200);
    const sellerConfirmBody = (await sellerConfirmRes.json()) as {
      data: {
        status: string;
        buyerConfirmed: boolean;
        sellerConfirmed: boolean;
        listing: { status: string };
      };
    };
    expect(sellerConfirmBody.data.status).toBe(TRANSACTION_STATUS.COMPLETED);
    expect(sellerConfirmBody.data.listing.status).toBe(LISTING_STATUS.SOLD);

    // Trang Shop công khai của A phản ánh huy hiệu & thống kê bán thành công
    const storefront = await getShopStorefront(shopASlug);
    expect(storefront).not.toBeNull();
    expect(storefront!.shop.isVerified).toBe(true);
    expect(storefront!.stats.soldCount).toBe(1);
    expect(storefront!.stats.completedDealsCount).toBeGreaterThanOrEqual(1);
  });

  it("6. Người dùng báo cáo tin đăng và Admin xử lý RESOLVED", async () => {
    const repRes = await createReport(
      makeRequest("/api/reports", "POST", buyerBId, {
        listingId: listingAId,
        reason: "Kiểm tra quy trình báo cáo",
        description: "Test báo cáo gửi lên Admin",
      }),
    );
    expect(repRes.status).toBe(201);
    const repBody = (await repRes.json()) as {
      data: { id: string; status: string };
    };
    reportId = repBody.data.id;
    expect(repBody.data.status).toBe(REPORT_STATUS.PENDING);

    const resolveRes = await resolveReport(
      makeRequest(`/api/reports/${reportId}`, "PATCH", adminId, {
        status: REPORT_STATUS.RESOLVED,
        adminNote: "Đã xác minh giữa 2 bên.",
        rejectListing: false,
      }),
      ctx(reportId),
    );
    expect(resolveRes.status).toBe(200);
    const resolvedBody = (await resolveRes.json()) as {
      data: { status: string; adminNote: string | null };
    };
    expect(resolvedBody.data.status).toBe(REPORT_STATUS.RESOLVED);
    expect(resolvedBody.data.adminNote).toBe("Đã xác minh giữa 2 bên.");
  });

  it("7. Chủ Shop tải lên ảnh đại diện (avatar Data URL) -> lưu vào DB & từ chối SVG/chuỗi độc hại", async () => {
    const samplePng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    // SVG hoặc URL không hợp lệ phải bị chặn 400
    const badRes = await updateMyShopRoute(
      makeRequest("/api/shop/me", "PATCH", buyerAId, {
        name: `Shop Công Nghệ A ${suffix.slice(0, 6)}`,
        city: "Hà Nội",
        avatarUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
      }),
    );
    expect(badRes.status).toBe(400);

    // Cập nhật ảnh PNG hợp lệ -> lưu DB
    const patchRes = await updateMyShopRoute(
      makeRequest("/api/shop/me", "PATCH", buyerAId, {
        name: `Shop Công Nghệ A ${suffix.slice(0, 6)}`,
        city: "Hà Nội",
        avatarUrl: samplePng,
        bannerTheme: "emerald",
      }),
    );
    expect(patchRes.status).toBe(200);
    const patchBody = (await patchRes.json()) as {
      data: { avatarUrl: string | null; bannerTheme: string };
    };
    expect(patchBody.data.avatarUrl).toBe(samplePng);
    expect(patchBody.data.bannerTheme).toBe("emerald");

    // Đọc lại từ GET /api/shop/me & getShopStorefront
    const getRes = await getMyShopRoute(makeRequest("/api/shop/me", "GET", buyerAId));
    expect(getRes.status).toBe(200);
    const getBody = (await getRes.json()) as {
      data: { avatarUrl: string | null };
    };
    expect(getBody.data.avatarUrl).toBe(samplePng);

    const storefront = await getShopStorefront(shopASlug);
    expect(storefront?.shop.avatarUrl).toBe(samplePng);

    // Xóa avatar về null
    const clearRes = await updateMyShopRoute(
      makeRequest("/api/shop/me", "PATCH", buyerAId, {
        name: `Shop Công Nghệ A ${suffix.slice(0, 6)}`,
        city: "Hà Nội",
        avatarUrl: null,
      }),
    );
    expect(clearRes.status).toBe(200);
    const clearBody = (await clearRes.json()) as {
      data: { avatarUrl: string | null };
    };
    expect(clearBody.data.avatarUrl).toBeNull();
  });
});
