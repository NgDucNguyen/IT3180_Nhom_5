import type { Condition, ListingStatus } from "@/lib/constants";

export type SortOption = "newest" | "price_asc" | "price_desc";

export interface DiscoveryFilterParams {
  q?: string;
  category?: string;
  brand?: string;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  allowExchange?: boolean;
  sort: SortOption;
  page: number;
  limit: number;
}

export interface CatalogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  activeCount: number;
}

export interface CatalogBrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  activeCount: number;
}

export interface DiscoveryCatalogSummary {
  categories: CatalogCategoryItem[];
  brands: CatalogBrandItem[];
  totalActiveListings: number;
  totalExchangeListings: number;
}

export interface DiscoveryListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  specs: Record<string, string>;
  images: string[];
  allowExchange: boolean;
  exchangePreference: string | null;
  status: ListingStatus;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  } | null;
  seller: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface DiscoverySearchResult {
  items: DiscoveryListingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  appliedFilters: DiscoveryFilterParams;
}

export interface DiscoveryListingDetail extends DiscoveryListingItem {
  updatedAt: Date;
  seller: {
    id: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
  isAvailableForDeal: boolean;
  pendingPurchaseRequestCount: number;
  pendingExchangeOfferCount: number;
}
