import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LISTING_STATUS, isCondition, isListingStatus, type ListingStatus } from "@/lib/constants";
import { assertListingTransition, isListingEditable } from "@/lib/listing-state";
import { ListingError } from "./errors";
import { getSellerListingFilters } from "./validation";
import type { ListingInput, SellerListing, SellerListingsResult } from "./types";

const SELLER_LISTING_SELECT = {
  id: true, sellerId: true, categoryId: true, brandId: true,
  title: true, description: true, price: true, condition: true,
  specsJson: true, imagesJson: true, allowExchange: true, exchangePreference: true,
  status: true, createdAt: true, updatedAt: true,
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
} satisfies Prisma.ListingSelect;

type ListingRow = Prisma.ListingGetPayload<{ select: typeof SELLER_LISTING_SELECT }>;

function serializeListing(row: ListingRow): SellerListing {
  if (!isListingStatus(row.status) || !isCondition(row.condition)) {
    throw new ListingError("INTERNAL_ERROR", "Dữ liệu trạng thái hoặc tình trạng tin đăng không hợp lệ.", 500);
  }
  return { ...row, status: row.status, condition: row.condition,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

async function assertCatalogReferences(tx: Prisma.TransactionClient, input: Partial<ListingInput>) {
  if (input.categoryId) {
    const category = await tx.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw new ListingError("VALIDATION_ERROR", "Danh mục không tồn tại.", 400);
  }
  if (input.brandId) {
    const brand = await tx.brand.findUnique({ where: { id: input.brandId }, select: { id: true } });
    if (!brand) throw new ListingError("VALIDATION_ERROR", "Thương hiệu không tồn tại.", 400);
  }
}

async function getOwnedListing(tx: Prisma.TransactionClient, id: string, sellerId: string) {
  const row = await tx.listing.findUnique({ where: { id }, select: SELLER_LISTING_SELECT });
  if (!row) throw new ListingError("NOT_FOUND", "Không tìm thấy tin đăng.", 404);
  if (row.sellerId !== sellerId) throw new ListingError("FORBIDDEN", "Bạn không phải chủ tin đăng.", 403);
  if (!isListingStatus(row.status)) throw new ListingError("CONFLICT", "Trạng thái tin đăng không hợp lệ.", 409);
  return row;
}

export async function createListing(sellerId: string, input: ListingInput): Promise<SellerListing> {
  return prisma.$transaction(async (tx) => {
    await assertCatalogReferences(tx, input);
    const row = await tx.listing.create({
      data: { ...input, sellerId, status: LISTING_STATUS.PENDING },
      select: SELLER_LISTING_SELECT,
    });
    return serializeListing(row);
  });
}

export async function getSellerListings(sellerId: string, params: URLSearchParams): Promise<SellerListingsResult> {
  const { page, limit, skip, status } = getSellerListingFilters(params);
  const where = { sellerId, ...(status ? { status } : {}) };
  const [rows, total] = await prisma.$transaction([
    prisma.listing.findMany({ where, select: SELLER_LISTING_SELECT, skip, take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    prisma.listing.count({ where }),
  ]);
  return { items: rows.map(serializeListing), page, limit, total };
}

async function updateOwnedListing(tx: Prisma.TransactionClient, row: ListingRow, data: Prisma.ListingUpdateManyMutationInput) {
  // Không ghi đè trạng thái nếu giao dịch/kiểm duyệt đã thay đổi tin sau khi đọc.
  const result = await tx.listing.updateMany({
    where: { id: row.id, sellerId: row.sellerId, status: row.status, updatedAt: row.updatedAt },
    data,
  });
  if (result.count !== 1) throw new ListingError("CONFLICT", "Tin đăng vừa thay đổi. Vui lòng tải lại.", 409);
  return serializeListing(await tx.listing.findUniqueOrThrow({ where: { id: row.id }, select: SELLER_LISTING_SELECT }));
}

export async function editListing(sellerId: string, id: string, input: Partial<ListingInput>): Promise<SellerListing> {
  return prisma.$transaction(async (tx) => {
    const row = await getOwnedListing(tx, id, sellerId);
    const status = row.status as ListingStatus;
    if (!isListingEditable(status)) throw new ListingError("CONFLICT", "Không thể sửa tin đang giao dịch, đã bán hoặc đã trao đổi.", 409);
    await assertCatalogReferences(tx, input);
    const updates = { ...input };
    if (!(input.allowExchange ?? row.allowExchange)) updates.exchangePreference = null;
    const changed = (Object.keys(updates) as (keyof ListingInput)[]).some((key) => updates[key] !== row[key]);
    let nextStatus = status;
    if (status === LISTING_STATUS.REJECTED) {
      assertListingTransition(status, LISTING_STATUS.PENDING);
      nextStatus = LISTING_STATUS.PENDING;
    } else if (changed && status === LISTING_STATUS.ACTIVE) {
      // Sửa nội dung ACTIVE phải duyệt lại theo AGENTS; helper TV2 chưa có cạnh này.
      nextStatus = LISTING_STATUS.PENDING;
    }
    if (!changed && nextStatus === status) return serializeListing(row);
    return updateOwnedListing(tx, row, { ...updates, status: nextStatus });
  });
}

export async function toggleListingVisibility(sellerId: string, id: string): Promise<SellerListing> {
  return prisma.$transaction(async (tx) => {
    const row = await getOwnedListing(tx, id, sellerId);
    const status = row.status as ListingStatus;
    const nextStatus = status === LISTING_STATUS.HIDDEN ? LISTING_STATUS.ACTIVE : LISTING_STATUS.HIDDEN;
    try {
      assertListingTransition(status, nextStatus);
    } catch {
      throw new ListingError("CONFLICT", "Chỉ có thể ẩn tin đang bán hoặc bỏ ẩn tin đã ẩn.", 409);
    }
    return updateOwnedListing(tx, row, { status: nextStatus });
  });
}
