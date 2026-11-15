import type { Prisma } from "@prisma/client";
import {
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  type PurchaseRequestStatus,
} from "@/lib/constants";
import {
  assertPurchaseRequestTransition,
  isListingAvailableForDeal,
} from "@/lib/listing-state";
import { prisma } from "@/lib/prisma";
import { PurchaseError } from "./errors";

const PURCHASE_REQUEST_SELECT = {
  id: true,
  listingId: true,
  buyerId: true,
  offeredPrice: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  listing: {
    select: {
      id: true,
      title: true,
      price: true,
      condition: true,
      status: true,
      imagesJson: true,
      sellerId: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          shop: { select: { name: true, slug: true, isVerified: true } },
        },
      },
    },
  },
  buyer: {
    select: {
      id: true,
      fullName: true,
      phone: true,
    },
  },
  transaction: {
    select: { id: true, status: true },
  },
} satisfies Prisma.PurchaseRequestSelect;

export type PurchaseRequestDTO = Prisma.PurchaseRequestGetPayload<{
  select: typeof PURCHASE_REQUEST_SELECT;
}>;

/** Parse & kiểm tra dữ liệu tạo yêu cầu mua (POST /api/purchase-requests). */
export async function parseCreatePurchaseRequestInput(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new PurchaseError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new PurchaseError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }
  const input = body as Record<string, unknown>;
  const listingId =
    typeof input.listingId === "string" ? input.listingId.trim() : "";
  if (!listingId) {
    throw new PurchaseError("VALIDATION_ERROR", "Thiếu mã sản phẩm.", 400);
  }

  let offeredPrice = 0;
  if (input.offeredPrice !== undefined && input.offeredPrice !== null && input.offeredPrice !== "") {
    const parsedPrice = Number(input.offeredPrice);
    if (
      !Number.isInteger(parsedPrice) ||
      parsedPrice < 0 ||
      parsedPrice > 2_147_483_647
    ) {
      throw new PurchaseError(
        "VALIDATION_ERROR",
        "Giá đề nghị phải là số nguyên từ 0 đến 2.147.483.647 VND.",
        400,
      );
    }
    offeredPrice = parsedPrice;
  }

  let message: string | null = null;
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== "string") {
      throw new PurchaseError("VALIDATION_ERROR", "Lời nhắn không hợp lệ.", 400);
    }
    const trimmed = input.message.trim();
    if (trimmed.length > 500) {
      throw new PurchaseError(
        "VALIDATION_ERROR",
        "Lời nhắn tối đa 500 ký tự.",
        400,
      );
    }
    message = trimmed || null;
  }

  return { listingId, offeredPrice, message };
}

/** Tạo yêu cầu mua mới cho 1 sản phẩm đang ACTIVE. */
export async function createPurchaseRequest(
  buyerId: string,
  input: { listingId: string; offeredPrice: number; message: string | null },
) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: input.listingId },
      select: { id: true, sellerId: true, status: true, price: true },
    });

    if (!listing) {
      throw new PurchaseError("NOT_FOUND", "Sản phẩm không tồn tại.", 404);
    }
    if (listing.sellerId === buyerId) {
      throw new PurchaseError(
        "FORBIDDEN",
        "Bạn không thể tự gửi yêu cầu mua sản phẩm của Shop mình.",
        403,
      );
    }
    if (
      !isListingAvailableForDeal(
        listing.status as typeof LISTING_STATUS.ACTIVE,
      )
    ) {
      throw new PurchaseError(
        "CONFLICT",
        "Sản phẩm này hiện không ở trạng thái mở bán.",
        409,
      );
    }

    const existingPending = await tx.purchaseRequest.findFirst({
      where: {
        listingId: input.listingId,
        buyerId,
        status: PURCHASE_REQUEST_STATUS.PENDING,
      },
      select: { id: true },
    });

    if (existingPending) {
      throw new PurchaseError(
        "CONFLICT",
        "Bạn đã gửi yêu cầu mua đang chờ phản hồi cho sản phẩm này.",
        409,
      );
    }

    const resolvedPrice =
      input.offeredPrice > 0 ? input.offeredPrice : listing.price;

    return tx.purchaseRequest.create({
      data: {
        listingId: input.listingId,
        buyerId,
        offeredPrice: resolvedPrice,
        message: input.message,
        status: PURCHASE_REQUEST_STATUS.PENDING,
      },
      select: PURCHASE_REQUEST_SELECT,
    });
  });
}

/** Danh sách yêu cầu mua: sent (người mua đã gửi) hoặc received (Shop nhận được). */
export async function listPurchaseRequests(
  userId: string,
  box: "sent" | "received" = "sent",
) {
  return prisma.purchaseRequest.findMany({
    where:
      box === "received"
        ? { listing: { sellerId: userId } }
        : { buyerId: userId },
    orderBy: { createdAt: "desc" },
    select: PURCHASE_REQUEST_SELECT,
  });
}

/** Người mua hủy yêu cầu mua đang ở trạng thái PENDING. */
export async function cancelPurchaseRequest(buyerId: string, requestId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.purchaseRequest.findUnique({
      where: { id: requestId },
      select: { id: true, buyerId: true, status: true },
    });

    if (!existing) {
      throw new PurchaseError("NOT_FOUND", "Không tìm thấy yêu cầu mua.", 404);
    }
    if (existing.buyerId !== buyerId) {
      throw new PurchaseError(
        "FORBIDDEN",
        "Bạn không có quyền hủy yêu cầu mua của người khác.",
        403,
      );
    }

    try {
      assertPurchaseRequestTransition(
        existing.status as PurchaseRequestStatus,
        PURCHASE_REQUEST_STATUS.CANCELLED,
      );
    } catch {
      throw new PurchaseError(
        "CONFLICT",
        "Chỉ có thể hủy yêu cầu đang ở trạng thái chờ phản hồi.",
        409,
      );
    }

    return tx.purchaseRequest.update({
      where: { id: existing.id },
      data: { status: PURCHASE_REQUEST_STATUS.CANCELLED },
      select: PURCHASE_REQUEST_SELECT,
    });
  });
}
