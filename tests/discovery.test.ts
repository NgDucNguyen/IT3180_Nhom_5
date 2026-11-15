import { describe, expect, it } from "vitest";
import {
  formatPriceVnd,
  getStatusBadgeMeta,
  resolveListingImages,
} from "@/components/ui";
import {
  formatSpecLabel,
  getDiscoveryCatalog,
  getHomeFeaturedData,
  getListingDetailById,
  normalizeDiscoverySearchParams,
  parseSpecsJson,
  searchActiveListings,
  serializeDiscoverySearchParams,
} from "@/features/discovery";
import {
  CONDITION,
  EXCHANGE_OFFER_STATUS,
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  REPORT_STATUS,
  TRANSACTION_STATUS,
} from "@/lib/constants";

/**
 * TEST SUITE CHO MODULE UI KIT & DISCOVERY — TV4 (UI/UX Lead)
 */
describe("Shared UI Helpers — StatusBadge & PriceText (TV4)", () => {
  it("getStatusBadgeMeta trả đúng nhãn tiếng Việt và màu sắc cho Listing, PurchaseRequest, ExchangeOffer, Transaction, Report", () => {
    expect(getStatusBadgeMeta(LISTING_STATUS.ACTIVE, "listing")).toMatchObject({
      label: "Đang bán",
      tone: "success",
    });
    expect(
      getStatusBadgeMeta(LISTING_STATUS.EXCHANGED, "listing"),
    ).toMatchObject({
      label: "Đã trao đổi",
      tone: "exchange",
    });
    expect(
      getStatusBadgeMeta(PURCHASE_REQUEST_STATUS.PENDING, "purchaseRequest"),
    ).toMatchObject({
      label: "Chờ người bán phản hồi",
      tone: "warning",
    });
    expect(
      getStatusBadgeMeta(EXCHANGE_OFFER_STATUS.ACCEPTED, "exchangeOffer"),
    ).toMatchObject({
      label: "Đồng ý trao đổi",
      tone: "exchange",
    });
    expect(
      getStatusBadgeMeta(TRANSACTION_STATUS.COMPLETED, "transaction"),
    ).toMatchObject({
      label: "Giao dịch hoàn tất",
      tone: "success",
    });
    expect(getStatusBadgeMeta(REPORT_STATUS.PENDING, "report")).toMatchObject({
      label: "Chờ xử lý báo cáo",
      tone: "warning",
    });
    expect(getStatusBadgeMeta(CONDITION.LIKE_NEW, "condition")).toMatchObject({
      label: "Như mới",
      tone: "info",
    });
  });

  it("formatPriceVnd định dạng đúng tiền tệ VNĐ và xử lý số âm an toàn", () => {
    expect(formatPriceVnd(25900000)).toBe("25.900.000 ₫");
    expect(formatPriceVnd(0)).toBe("0 ₫");
    expect(formatPriceVnd(-5000)).toBe("0 ₫");
  });

  it("resolveListingImages giải mã JSON ảnh hợp lệ và fallback khi JSON lỗi", () => {
    expect(resolveListingImages(undefined, '["/images/test.svg"]')).toEqual([
      "/images/test.svg",
    ]);
    expect(resolveListingImages(undefined, "{invalid-json")).toEqual([
      "/images/placeholder-device.svg",
    ]);
  });
});

describe("Discovery Utils — Chuẩn hoá bộ lọc & Thông số kỹ thuật (TV4)", () => {
  it("parseSpecsJson và formatSpecLabel chuyển đổi đúng thông số kỹ thuật", () => {
    const specs = parseSpecsJson('{"screen":"6.7 inch","battery":"98%"}');
    expect(specs).toEqual({ screen: "6.7 inch", battery: "98%" });
    expect(formatSpecLabel("screen")).toBe("Màn hình");
    expect(parseSpecsJson("bad-json")).toEqual({});
  });

  it("normalizeDiscoverySearchParams tự động hoán đổi khi minPrice > maxPrice và chặn tham số sai", () => {
    const normalized = normalizeDiscoverySearchParams({
      q: "  MacBook  ",
      condition: "INVALID_CONDITION",
      minPrice: "30000000",
      maxPrice: "10000000",
      allowExchange: "true",
      page: "-3",
    });

    expect(normalized.q).toBe("MacBook");
    expect(normalized.condition).toBeUndefined();
    expect(normalized.minPrice).toBe(10000000);
    expect(normalized.maxPrice).toBe(30000000);
    expect(normalized.allowExchange).toBe(true);
    expect(normalized.page).toBe(1);
  });

  it("serializeDiscoverySearchParams tạo đúng đối tượng query từ bộ lọc", () => {
    const serialized = serializeDiscoverySearchParams({
      q: "iPhone",
      category: "dien-thoai",
      allowExchange: true,
      sort: "price_asc",
    });
    expect(serialized).toMatchObject({
      q: "iPhone",
      category: "dien-thoai",
      allowExchange: "true",
      sort: "price_asc",
    });
  });
});

describe("Discovery Prisma Queries — Tìm kiếm, Lọc & Xem chi tiết (TV4)", () => {
  it("getDiscoveryCatalog trả đủ danh mục, thương hiệu và số tin đang ACTIVE", async () => {
    const catalog = await getDiscoveryCatalog();
    expect(catalog.categories).toHaveLength(5);
    expect(catalog.brands).toHaveLength(6);
    expect(catalog.totalActiveListings).toBeGreaterThanOrEqual(9);
    expect(catalog.totalExchangeListings).toBeGreaterThanOrEqual(6);
  });

  it("getHomeFeaturedData trả danh sách tin mới nhất và tin nhận trao đổi cho Trang chủ", async () => {
    const homeData = await getHomeFeaturedData();
    expect(homeData.exchangeListings.length).toBeGreaterThan(0);
    expect(homeData.latestListings.length).toBeGreaterThan(0);
    for (const item of homeData.exchangeListings) {
      expect(item.allowExchange).toBe(true);
      expect(item.status).toBe(LISTING_STATUS.ACTIVE);
    }
  });

  it("searchActiveListings chỉ trả về tin ACTIVE và lọc chính xác theo tiêu chí", async () => {
    const result = await searchActiveListings({
      category: "laptop",
      allowExchange: "true",
    });

    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.status).toBe(LISTING_STATUS.ACTIVE);
      expect(item.category.slug).toBe("laptop");
      expect(item.allowExchange).toBe(true);
    }
  });

  it("searchActiveListings hỗ trợ sắp xếp theo giá tăng dần (price_asc) và khoảng giá", async () => {
    const result = await searchActiveListings({
      minPrice: "5000000",
      maxPrice: "40000000",
      sort: "price_asc",
    });

    expect(result.items.length).toBeGreaterThan(1);
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].price).toBeGreaterThanOrEqual(
        result.items[i - 1].price,
      );
      expect(result.items[i].price).toBeGreaterThanOrEqual(5000000);
      expect(result.items[i].price).toBeLessThanOrEqual(40000000);
    }
  });

  it("getListingDetailById trả chi tiết đầy đủ cho tin ACTIVE và không lộ passwordHash", async () => {
    const { listing, relatedListings } =
      await getListingDetailById("lst-iphone15pm");

    expect(listing).not.toBeNull();
    expect(listing?.title).toContain("iPhone 15 Pro Max");
    expect(listing?.specs).toHaveProperty("screen");
    expect(listing?.seller).not.toHaveProperty("passwordHash");
    expect(relatedListings.length).toBeGreaterThan(0);
  });

  it("getListingDetailById trả null đối với tin PENDING hoặc ID không tồn tại (case lỗi/bảo mật)", async () => {
    const pendingRes = await getListingDetailById("lst-tab-s9");
    expect(pendingRes.listing).toBeNull();

    const notFoundRes = await getListingDetailById("id-khong-ton-tai-999");
    expect(notFoundRes.listing).toBeNull();
  });
});
