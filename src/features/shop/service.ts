import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { PUBLIC_USER_SELECT } from "@/lib/auth";
import {
  LISTING_STATUS,
  ROLES,
  SHOP_BANNER_THEMES,
  TRANSACTION_STATUS,
  USER_STATUS,
  type ShopBannerTheme,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ShopError } from "./errors";
import type {
  ShopCategoryBreakdown,
  ShopDirectoryItemDTO,
  ShopProfileDTO,
  ShopStorefrontDTO,
  ShopUpsertInput,
} from "./types";
import { slugifyShopName } from "./validation";

const SHOP_SELECT = {
  id: true,
  ownerId: true,
  name: true,
  slug: true,
  avatarUrl: true,
  tagline: true,
  description: true,
  city: true,
  address: true,
  contactPhone: true,
  bannerTheme: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShopSelect;

type RawShopRow = Prisma.ShopGetPayload<{ select: typeof SHOP_SELECT }>;

function serializeShop(row: RawShopRow): ShopProfileDTO {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    slug: row.slug,
    avatarUrl: row.avatarUrl,
    tagline: row.tagline,
    description: row.description,
    city: row.city,
    address: row.address,
    contactPhone: row.contactPhone,
    bannerTheme: (row.bannerTheme || SHOP_BANNER_THEMES.INDIGO) as ShopBannerTheme,
    isVerified: row.isVerified,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SHOP_LISTING_SELECT = {
  id: true,
  title: true,
  price: true,
  condition: true,
  allowExchange: true,
  exchangePreference: true,
  status: true,
  imagesJson: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true, icon: true },
  },
  brand: {
    select: { id: true, name: true, slug: true },
  },
  seller: {
    select: {
      id: true,
      fullName: true,
      shop: { select: { name: true, slug: true, isVerified: true } },
    },
  },
} satisfies Prisma.ListingSelect;

/** Nâng cấp tài khoản Người mua (USER) lên Người bán (SELLER) và khởi tạo Shop. */
export async function upgradeUserToShop(
  userId: string,
  input: ShopUpsertInput,
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        status: true,
        phone: true,
        shop: { select: { id: true } },
      },
    });

    if (!user) {
      throw new ShopError("NOT_FOUND", "Không tìm thấy tài khoản.", 404);
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ShopError("FORBIDDEN", "Tài khoản đang bị khóa.", 403);
    }
    if (user.role === ROLES.ADMIN) {
      throw new ShopError(
        "FORBIDDEN",
        "Tài khoản Quản trị viên không thể nâng cấp thành Shop.",
        403,
      );
    }
    if (user.shop || user.role === ROLES.SELLER) {
      throw new ShopError(
        "CONFLICT",
        "Tài khoản của bạn đã được nâng cấp thành Shop trước đó.",
        409,
      );
    }

    let candidateSlug = input.slug || slugifyShopName(input.name) || "elade-shop";
    if (candidateSlug.length < 3) {
      candidateSlug = `shop-${candidateSlug}`;
    }

    const existingSlug = await tx.shop.findUnique({
      where: { slug: candidateSlug },
      select: { id: true },
    });

    if (existingSlug) {
      if (input.slug) {
        throw new ShopError(
          "CONFLICT",
          "Đường dẫn Shop (slug) này đã được sử dụng, vui lòng chọn tên khác.",
          409,
        );
      }
      candidateSlug = `${candidateSlug}-${randomInt(100, 999)}`;
    }

    const createdShop = await tx.shop.create({
      data: {
        ownerId: userId,
        name: input.name,
        slug: candidateSlug,
        avatarUrl: input.avatarUrl ?? null,
        tagline: input.tagline,
        description: input.description,
        city: input.city,
        address: input.address,
        contactPhone: input.contactPhone ?? user.phone,
        bannerTheme: input.bannerTheme,
      },
      select: SHOP_SELECT,
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        role: ROLES.SELLER,
        ...( !user.phone && input.contactPhone ? { phone: input.contactPhone } : {} ),
      },
      select: PUBLIC_USER_SELECT,
    });

    return {
      shop: serializeShop(createdShop),
      user: updatedUser,
    };
  });
}

/** Lấy hồ sơ Shop của user đang đăng nhập (null nếu chưa mở Shop). */
export async function getMyShop(userId: string): Promise<ShopProfileDTO | null> {
  const row = await prisma.shop.findUnique({
    where: { ownerId: userId },
    select: SHOP_SELECT,
  });
  return row ? serializeShop(row) : null;
}

/** Chủ Shop cập nhật giao diện & thông tin cửa hàng của mình. */
export async function updateMyShop(
  userId: string,
  input: ShopUpsertInput,
): Promise<ShopProfileDTO> {
  const existing = await prisma.shop.findUnique({
    where: { ownerId: userId },
    select: { id: true, slug: true },
  });

  if (!existing) {
    throw new ShopError(
      "FORBIDDEN",
      "Bạn chưa mở Shop. Hãy nâng cấp tài khoản thành Người bán trước.",
      403,
    );
  }

  let nextSlug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    const conflict = await prisma.shop.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (conflict) {
      throw new ShopError(
        "CONFLICT",
        "Đường dẫn Shop (slug) này đã có người sử dụng.",
        409,
      );
    }
    nextSlug = input.slug;
  }

  const updated = await prisma.shop.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      slug: nextSlug,
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      tagline: input.tagline,
      description: input.description,
      city: input.city,
      address: input.address,
      contactPhone: input.contactPhone,
      bannerTheme: input.bannerTheme,
    },
    select: SHOP_SELECT,
  });

  return serializeShop(updated);
}

/** Truy vấn đầy đủ trang Shop công khai theo slug, shopId hoặc ownerId. */
export async function getShopStorefront(
  slugOrId: string,
): Promise<ShopStorefrontDTO | null> {
  const key = slugOrId.trim();
  if (!key) return null;

  const shop = await prisma.shop.findFirst({
    where: {
      OR: [{ slug: key }, { id: key }, { ownerId: key }],
    },
    select: {
      ...SHOP_SELECT,
      owner: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!shop || shop.owner.status !== USER_STATUS.ACTIVE) {
    return null;
  }

  const [listings, completedTxCount, cancelledTxCount] = await Promise.all([
    prisma.listing.findMany({
      where: {
        sellerId: shop.ownerId,
        status: {
          in: [
            LISTING_STATUS.ACTIVE,
            LISTING_STATUS.IN_TRANSACTION,
            LISTING_STATUS.SOLD,
            LISTING_STATUS.EXCHANGED,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: SHOP_LISTING_SELECT,
    }),
    prisma.transaction.count({
      where: {
        sellerId: shop.ownerId,
        status: TRANSACTION_STATUS.COMPLETED,
      },
    }),
    prisma.transaction.count({
      where: {
        sellerId: shop.ownerId,
        status: TRANSACTION_STATUS.CANCELLED,
      },
    }),
  ]);

  const activeListings = listings.filter(
    (item) => item.status === LISTING_STATUS.ACTIVE,
  );
  const completedListings = listings.filter(
    (item) =>
      item.status === LISTING_STATUS.SOLD ||
      item.status === LISTING_STATUS.EXCHANGED,
  );

  const categoryMap = new Map<string, ShopCategoryBreakdown>();
  let exchangeAvailableCount = 0;

  for (const item of activeListings) {
    if (item.allowExchange) exchangeAvailableCount += 1;
    const prev = categoryMap.get(item.category.id);
    if (prev) {
      prev.count += 1;
    } else {
      categoryMap.set(item.category.id, {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        icon: item.category.icon,
        count: 1,
      });
    }
  }

  const soldCount = listings.filter(
    (item) => item.status === LISTING_STATUS.SOLD,
  ).length;
  const exchangedCount = listings.filter(
    (item) => item.status === LISTING_STATUS.EXCHANGED,
  ).length;

  const totalClosedTx = completedTxCount + cancelledTxCount;
  const completionRate =
    totalClosedTx > 0
      ? Math.round((completedTxCount / totalClosedTx) * 100)
      : null;

  return {
    shop: serializeShop(shop),
    owner: {
      id: shop.owner.id,
      fullName: shop.owner.fullName,
      avatarUrl: shop.owner.avatarUrl,
      status: shop.owner.status,
      createdAt: shop.owner.createdAt.toISOString(),
    },
    stats: {
      activeCount: activeListings.length,
      soldCount,
      exchangedCount,
      completedDealsCount: Math.max(completedTxCount, completedListings.length),
      exchangeAvailableCount,
      completionRate,
      categories: Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name, "vi"),
      ),
    },
    activeListings,
    completedListings,
  };
}

/** Danh sách các Shop đang hoạt động trên sàn cho trang /shops. */
export async function listPublicShops(
  query?: string,
): Promise<ShopDirectoryItemDTO[]> {
  const q = query?.trim();
  const shops = await prisma.shop.findMany({
    where: {
      owner: { status: USER_STATUS.ACTIVE },
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { tagline: { contains: q } },
              { city: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ isVerified: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      ownerId: true,
      name: true,
      slug: true,
      avatarUrl: true,
      tagline: true,
      city: true,
      bannerTheme: true,
      isVerified: true,
      createdAt: true,
      owner: {
        select: {
          fullName: true,
          listings: {
            where: {
              status: {
                in: [
                  LISTING_STATUS.ACTIVE,
                  LISTING_STATUS.SOLD,
                  LISTING_STATUS.EXCHANGED,
                ],
              },
            },
            select: { status: true, allowExchange: true },
          },
        },
      },
    },
  });

  return shops.map((shop) => {
    let activeCount = 0;
    let completedCount = 0;
    let exchangeCount = 0;

    for (const item of shop.owner.listings) {
      if (item.status === LISTING_STATUS.ACTIVE) {
        activeCount += 1;
        if (item.allowExchange) exchangeCount += 1;
      } else {
        completedCount += 1;
      }
    }

    return {
      id: shop.id,
      ownerId: shop.ownerId,
      name: shop.name,
      slug: shop.slug,
      avatarUrl: shop.avatarUrl,
      tagline: shop.tagline,
      city: shop.city,
      bannerTheme: (shop.bannerTheme || SHOP_BANNER_THEMES.INDIGO) as ShopBannerTheme,
      isVerified: shop.isVerified,
      createdAt: shop.createdAt.toISOString(),
      ownerName: shop.owner.fullName,
      activeCount,
      completedCount,
      exchangeCount,
    };
  });
}
