import { LISTING_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export interface CatalogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  listingCount: number;
}

export interface CatalogCategoryDetail extends CatalogCategoryItem {
  activeListingCount: number;
}

export interface CatalogBrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  listingCount: number;
}

export interface CatalogBrandDetail extends CatalogBrandItem {
  activeListingCount: number;
}

/**
 * Lấy danh sách tất cả danh mục thiết bị kèm tổng số tin đăng,
 * sắp xếp theo bảng chữ cái tiếng Việt.
 */
export async function getCatalogCategories(): Promise<CatalogCategoryItem[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      _count: { select: { listings: true } },
    },
  });

  return categories
    .map(({ _count, ...category }) => ({
      ...category,
      listingCount: _count.listings,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

/**
 * Lấy chi tiết một danh mục theo slug kèm số tin tổng và số tin đang ACTIVE.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<CatalogCategoryDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  const category = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      _count: { select: { listings: true } },
      listings: {
        where: { status: LISTING_STATUS.ACTIVE },
        select: { id: true },
      },
    },
  });

  if (!category) {
    return null;
  }

  const { _count, listings, ...rest } = category;
  return {
    ...rest,
    listingCount: _count.listings,
    activeListingCount: listings.length,
  };
}

/**
 * Lấy danh sách tất cả thương hiệu kèm tổng số tin đăng,
 * sắp xếp theo bảng chữ cái tiếng Việt.
 */
export async function getCatalogBrands(): Promise<CatalogBrandItem[]> {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { listings: true } },
    },
  });

  return brands
    .map(({ _count, ...brand }) => ({
      ...brand,
      listingCount: _count.listings,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

/**
 * Lấy chi tiết một thương hiệu theo slug kèm số tin tổng và số tin đang ACTIVE.
 */
export async function getBrandBySlug(
  slug: string,
): Promise<CatalogBrandDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  const brand = await prisma.brand.findUnique({
    where: { slug: normalizedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { listings: true } },
      listings: {
        where: { status: LISTING_STATUS.ACTIVE },
        select: { id: true },
      },
    },
  });

  if (!brand) {
    return null;
  }

  const { _count, listings, ...rest } = brand;
  return {
    ...rest,
    listingCount: _count.listings,
    activeListingCount: listings.length,
  };
}
