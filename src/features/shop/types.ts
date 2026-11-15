import type { ListingCardItem } from "@/components/ui";
import type { ShopBannerTheme } from "@/lib/constants";

/** Hồ sơ cửa hàng (Shop) của một Người bán trên Elade. */
export interface ShopProfileDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
  city: string;
  address: string | null;
  contactPhone: string | null;
  bannerTheme: ShopBannerTheme;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Danh mục sản phẩm hiện có trong Shop. */
export interface ShopCategoryBreakdown {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  count: number;
}

/** Chỉ số uy tín & hoạt động hiển thị trên trang gian hàng của Shop. */
export interface ShopStatsDTO {
  activeCount: number;
  soldCount: number;
  exchangedCount: number;
  completedDealsCount: number;
  exchangeAvailableCount: number;
  completionRate: number | null;
  categories: ShopCategoryBreakdown[];
}

/** Dữ liệu đầy đủ cho Trang Shop công khai (/shops/[slug]). */
export interface ShopStorefrontDTO {
  shop: ShopProfileDTO;
  owner: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    status: string;
    createdAt: string;
  };
  stats: ShopStatsDTO;
  activeListings: ListingCardItem[];
  completedListings: ListingCardItem[];
}

/** Thông tin tóm tắt của 1 Shop trên trang danh sách /shops. */
export interface ShopDirectoryItemDTO {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  tagline: string | null;
  city: string;
  bannerTheme: ShopBannerTheme;
  isVerified: boolean;
  createdAt: string;
  ownerName: string;
  activeCount: number;
  completedCount: number;
  exchangeCount: number;
}

/** Dữ liệu đầu vào khi nâng cấp lên Shop hoặc cập nhật hồ sơ Shop. */
export interface ShopUpsertInput {
  name: string;
  slug?: string;
  avatarUrl?: string | null;
  tagline: string | null;
  description: string | null;
  city: string;
  address: string | null;
  contactPhone: string | null;
  bannerTheme: ShopBannerTheme;
}
