import type { Condition, ListingStatus } from "@/lib/constants";

export interface ListingInput {
  title: string;
  description: string;
  price: number;
  condition: Condition;
  categoryId: string;
  brandId: string | null;
  specsJson: string | null;
  imagesJson: string | null;
  allowExchange: boolean;
  exchangePreference: string | null;
}

export interface SellerListing extends ListingInput {
  id: string;
  sellerId: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
}

export interface SellerListingsResult {
  items: SellerListing[];
  page: number;
  limit: number;
  total: number;
}

export interface ListingCatalogOption {
  id: string;
  name: string;
}
