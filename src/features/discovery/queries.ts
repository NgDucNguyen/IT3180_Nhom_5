import type { Prisma } from "@prisma/client";
import {
  EXCHANGE_OFFER_STATUS,
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  type Condition,
  type ListingStatus,
} from "@/lib/constants";
import {
  isListingAvailableForDeal,
  isListingPubliclyVisible,
} from "@/lib/listing-state";
import { prisma } from "@/lib/prisma";
import type {
  DiscoveryCatalogSummary,
  DiscoveryFilterParams,
  DiscoveryListingDetail,
  DiscoveryListingItem,
  DiscoverySearchResult,
} from "./types";
import {
  normalizeDiscoverySearchParams,
  parseImagesJson,
  parseSpecsJson,
} from "./utils";

/**
 * Cấu hình select chuẩn cho thẻ sản phẩm (ListingCard) — tuyệt đối không lấy passwordHash.
 */
const LISTING_CARD_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  condition: true,
  specsJson: true,
  imagesJson: true,
  allowExchange: true,
  exchangePreference: true,
  status: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
    },
  },
  brand: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  seller: {
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          city: true,
          bannerTheme: true,
          isVerified: true,
        },
      },
    },
  },
} satisfies Prisma.ListingSelect;

type RawListingCardRow = Prisma.ListingGetPayload<{
  select: typeof LISTING_CARD_SELECT;
}>;

function mapRowToDiscoveryItem(row: RawListingCardRow): DiscoveryListingItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    condition: row.condition as Condition,
    specs: parseSpecsJson(row.specsJson),
    images: parseImagesJson(row.imagesJson),
    allowExchange: row.allowExchange,
    exchangePreference: row.exchangePreference,
    status: row.status as ListingStatus,
    createdAt: row.createdAt,
    category: row.category,
    brand: row.brand,
    seller: {
      id: row.seller.id,
      fullName: row.seller.fullName,
      avatarUrl: row.seller.avatarUrl,
      shop: row.seller.shop,
    },
  };
}

/**
 * Lấy danh mục, thương hiệu và thống kê số lượng tin ACTIVE phục vụ Trang chủ & Bộ lọc.
 */
export async function getDiscoveryCatalog(): Promise<DiscoveryCatalogSummary> {
  const [categories, brands, totalActiveListings, totalExchangeListings] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          _count: {
            select: {
              listings: {
                where: { status: LISTING_STATUS.ACTIVE },
              },
            },
          },
        },
      }),
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          _count: {
            select: {
              listings: {
                where: { status: LISTING_STATUS.ACTIVE },
              },
            },
          },
        },
      }),
      prisma.listing.count({
        where: { status: LISTING_STATUS.ACTIVE },
      }),
      prisma.listing.count({
        where: {
          status: LISTING_STATUS.ACTIVE,
          allowExchange: true,
        },
      }),
    ]);

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      activeCount: c._count.listings,
    })),
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      activeCount: b._count.listings,
    })),
    totalActiveListings,
    totalExchangeListings,
  };
}

/**
 * Lấy dữ liệu nổi bật cho Trang chủ (`/`):
 * - Danh mục & Thương hiệu kèm số tin đang bán
 * - Danh sách thiết bị nổi bật có nhận trao đổi (Swap)
 * - Danh sách tin đăng mới nhất đang ACTIVE
 */
export async function getHomeFeaturedData(): Promise<{
  catalog: DiscoveryCatalogSummary;
  exchangeListings: DiscoveryListingItem[];
  latestListings: DiscoveryListingItem[];
}> {
  const [catalog, rawExchange, rawLatest] = await Promise.all([
    getDiscoveryCatalog(),
    prisma.listing.findMany({
      where: {
        status: LISTING_STATUS.ACTIVE,
        allowExchange: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: LISTING_CARD_SELECT,
    }),
    prisma.listing.findMany({
      where: {
        status: LISTING_STATUS.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: LISTING_CARD_SELECT,
    }),
  ]);

  return {
    catalog,
    exchangeListings: rawExchange.map(mapRowToDiscoveryItem),
    latestListings: rawLatest.map(mapRowToDiscoveryItem),
  };
}

/**
 * Tìm kiếm và lọc đa tiêu chí các tin đăng công khai (`status = ACTIVE`).
 * Hỗ trợ: từ khoá `q`, `category` (slug/id), `brand` (slug/id), `condition`,
 * `minPrice`, `maxPrice`, `allowExchange`, sắp xếp và phân trang.
 */
export async function searchActiveListings(
  rawParams:
    | DiscoveryFilterParams
    | Record<string, string | string[] | undefined>,
): Promise<DiscoverySearchResult> {
  const filters: DiscoveryFilterParams =
    "sort" in rawParams &&
    "page" in rawParams &&
    "limit" in rawParams &&
    typeof rawParams.page === "number"
      ? (rawParams as DiscoveryFilterParams)
      : normalizeDiscoverySearchParams(
          rawParams as Record<string, string | string[] | undefined>,
        );

  const andConditions: Prisma.ListingWhereInput[] = [
    { status: LISTING_STATUS.ACTIVE },
  ];

  // Lọc theo từ khoá (tìm trên tiêu đề, mô tả, ghi chú trao đổi, tên hãng, tên danh mục)
  if (filters.q) {
    andConditions.push({
      OR: [
        { title: { contains: filters.q } },
        { description: { contains: filters.q } },
        { exchangePreference: { contains: filters.q } },
        { brand: { name: { contains: filters.q } } },
        { category: { name: { contains: filters.q } } },
      ],
    });
  }

  // Lọc theo Danh mục (chấp nhận cả slug hoặc id)
  if (filters.category) {
    andConditions.push({
      OR: [
        { category: { slug: filters.category } },
        { categoryId: filters.category },
      ],
    });
  }

  // Lọc theo Thương hiệu (chấp nhận cả slug hoặc id)
  if (filters.brand) {
    andConditions.push({
      OR: [{ brand: { slug: filters.brand } }, { brandId: filters.brand }],
    });
  }

  // Lọc theo Tình trạng thiết bị (NEW | LIKE_NEW | GOOD | FAIR)
  if (filters.condition) {
    andConditions.push({ condition: filters.condition });
  }

  // Lọc theo khoảng giá VNĐ
  if (filters.minPrice !== undefined) {
    andConditions.push({ price: { gte: filters.minPrice } });
  }
  if (filters.maxPrice !== undefined) {
    andConditions.push({ price: { lte: filters.maxPrice } });
  }

  // Lọc các thiết bị có nhận trao đổi
  if (filters.allowExchange === true) {
    andConditions.push({ allowExchange: true });
  }

  const where: Prisma.ListingWhereInput = { AND: andConditions };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { price: "asc" }
      : filters.sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const skip = (filters.page - 1) * filters.limit;

  const [total, rows] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: filters.limit,
      select: LISTING_CARD_SELECT,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  return {
    items: rows.map(mapRowToDiscoveryItem),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
    appliedFilters: filters,
  };
}

/**
 * Truy vấn chi tiết một sản phẩm theo ID kèm danh sách sản phẩm cùng danh mục.
 * Chỉ hiển thị sản phẩm công khai (ACTIVE) hoặc đang trong giao dịch/đã bán để xem thông tin;
 * ẩn hoàn toàn các tin PENDING, HIDDEN, REJECTED đối với trang công khai.
 */
export async function getListingDetailById(id: string): Promise<{
  listing: DiscoveryListingDetail | null;
  relatedListings: DiscoveryListingItem[];
}> {
  if (!id || id.trim().length === 0) {
    return { listing: null, relatedListings: [] };
  }

  const row = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      condition: true,
      specsJson: true,
      imagesJson: true,
      allowExchange: true,
      exchangePreference: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
              city: true,
              bannerTheme: true,
              isVerified: true,
              tagline: true,
            },
          },
          _count: {
            select: {
              listings: {
                where: { status: LISTING_STATUS.ACTIVE },
              },
            },
          },
        },
      },
      _count: {
        select: {
          purchaseRequests: {
            where: { status: PURCHASE_REQUEST_STATUS.PENDING },
          },
          offersAsTarget: {
            where: { status: EXCHANGE_OFFER_STATUS.PENDING },
          },
        },
      },
    },
  });

  if (!row) {
    return { listing: null, relatedListings: [] };
  }

  const status = row.status as ListingStatus;

  // Luật hiển thị: Tin PENDING / HIDDEN / REJECTED không hiển thị công khai trên Discovery
  const canViewDetail =
    isListingPubliclyVisible(status) ||
    status === LISTING_STATUS.IN_TRANSACTION ||
    status === LISTING_STATUS.SOLD ||
    status === LISTING_STATUS.EXCHANGED;

  if (!canViewDetail) {
    return { listing: null, relatedListings: [] };
  }

  const relatedRows = await prisma.listing.findMany({
    where: {
      categoryId: row.category.id,
      status: LISTING_STATUS.ACTIVE,
      id: { not: row.id },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: LISTING_CARD_SELECT,
  });

  const detail: DiscoveryListingDetail = {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    condition: row.condition as Condition,
    specs: parseSpecsJson(row.specsJson),
    images: parseImagesJson(row.imagesJson),
    allowExchange: row.allowExchange,
    exchangePreference: row.exchangePreference,
    status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.category,
    brand: row.brand,
    seller: {
      id: row.seller.id,
      fullName: row.seller.fullName,
      phone: row.seller.phone,
      avatarUrl: row.seller.avatarUrl,
      createdAt: row.seller.createdAt,
      shop: row.seller.shop,
      activeListingCount: row.seller._count.listings,
    },
    isAvailableForDeal: isListingAvailableForDeal(status),
    pendingPurchaseRequestCount: row._count.purchaseRequests,
    pendingExchangeOfferCount: row._count.offersAsTarget,
  };

  return {
    listing: detail,
    relatedListings: relatedRows.map(mapRowToDiscoveryItem),
  };
}
