import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LISTING_STATUS } from "@/lib/constants";
import { CartError } from "./errors";
import type { CartItemDTO, CartSummaryDTO } from "./types";

const CART_LISTING_SELECT = {
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
    select: { id: true, fullName: true },
  },
} as const;

type CartRecord = Prisma.CartItemGetPayload<{
  select: {
    id: true;
    listingId: true;
    createdAt: true;
    listing: { select: typeof CART_LISTING_SELECT };
  };
}>;

function toCartItemDTO(record: CartRecord): CartItemDTO {
  const available = record.listing.status === LISTING_STATUS.ACTIVE;
  return {
    id: record.id,
    listingId: record.listingId,
    createdAt: record.createdAt.toISOString(),
    available,
    listing: {
      id: record.listing.id,
      title: record.listing.title,
      price: record.listing.price,
      condition: record.listing.condition,
      allowExchange: record.listing.allowExchange,
      exchangePreference: record.listing.exchangePreference,
      status: record.listing.status,
      imagesJson: record.listing.imagesJson,
      createdAt: record.listing.createdAt.toISOString(),
      category: record.listing.category,
      brand: record.listing.brand,
      seller: record.listing.seller,
    },
  };
}

function summarizeCart(items: CartItemDTO[]): CartSummaryDTO {
  let availableCount = 0;
  let totalAmount = 0;
  for (const item of items) {
    if (item.available) {
      availableCount += 1;
      totalAmount += item.listing.price;
    }
  }
  return {
    items,
    totalCount: items.length,
    availableCount,
    totalAmount,
  };
}

/** Lấy danh sách giỏ hàng hiện tại của user kèm thống kê thiết bị còn hiệu lực. */
export async function getUserCart(userId: string): Promise<CartSummaryDTO> {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      listingId: true,
      createdAt: true,
      listing: { select: CART_LISTING_SELECT },
    },
  });

  return summarizeCart(rows.map(toCartItemDTO));
}

/** Đọc listingId từ JSON body của POST /api/cart. */
export async function parseAddCartInput(request: Request): Promise<string> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new CartError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new CartError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }
  const listingId = (body as Record<string, unknown>).listingId;
  if (typeof listingId !== "string" || !listingId.trim()) {
    throw new CartError("VALIDATION_ERROR", "Thiếu mã tin đăng (listingId).", 400);
  }
  return listingId.trim();
}

/**
 * Thêm 1 thiết bị vào giỏ hàng của người dùng.
 * Chặn tự thêm tin của chính mình, tin không ở trạng thái ACTIVE, hoặc thêm trùng.
 */
export async function addToCart(
  userId: string,
  listingId: string,
): Promise<{ item: CartItemDTO; totalCount: number }> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });

  if (!listing) {
    throw new CartError("NOT_FOUND", "Tin đăng không tồn tại.", 404);
  }
  if (listing.sellerId === userId) {
    throw new CartError(
      "FORBIDDEN",
      "Bạn không thể thêm thiết bị của chính mình vào giỏ hàng.",
      403,
    );
  }
  if (listing.status !== LISTING_STATUS.ACTIVE) {
    throw new CartError(
      "CONFLICT",
      "Chỉ có thể thêm thiết bị đang mở bán vào giỏ hàng.",
      409,
    );
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { id: true },
  });
  if (existing) {
    throw new CartError(
      "CONFLICT",
      "Thiết bị này đã có trong giỏ hàng của bạn.",
      409,
    );
  }

  try {
    const created = await prisma.cartItem.create({
      data: { userId, listingId },
      select: {
        id: true,
        listingId: true,
        createdAt: true,
        listing: { select: CART_LISTING_SELECT },
      },
    });

    const totalCount = await prisma.cartItem.count({ where: { userId } });
    return { item: toCartItemDTO(created), totalCount };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new CartError(
        "CONFLICT",
        "Thiết bị này đã có trong giỏ hàng của bạn.",
        409,
      );
    }
    throw error;
  }
}

/** Xóa 1 thiết bị khỏi giỏ hàng theo listingId. */
export async function removeFromCart(
  userId: string,
  listingId: string,
): Promise<{ listingId: string; totalCount: number }> {
  const normalizedId = listingId.trim();
  if (!normalizedId) {
    throw new CartError("VALIDATION_ERROR", "Mã tin đăng không hợp lệ.", 400);
  }

  const deleted = await prisma.cartItem.deleteMany({
    where: { userId, listingId: normalizedId },
  });

  if (deleted.count === 0) {
    throw new CartError(
      "NOT_FOUND",
      "Thiết bị này không nằm trong giỏ hàng.",
      404,
    );
  }

  const totalCount = await prisma.cartItem.count({ where: { userId } });
  return { listingId: normalizedId, totalCount };
}

/** Xóa toàn bộ giỏ hàng hoặc chỉ xóa các thiết bị không còn ACTIVE. */
export async function clearCart(
  userId: string,
  onlyUnavailable = false,
): Promise<{ deletedCount: number; totalCount: number }> {
  const result = await prisma.cartItem.deleteMany({
    where: onlyUnavailable
      ? {
          userId,
          listing: { status: { not: LISTING_STATUS.ACTIVE } },
        }
      : { userId },
  });

  const totalCount = await prisma.cartItem.count({ where: { userId } });
  return { deletedCount: result.count, totalCount };
}
