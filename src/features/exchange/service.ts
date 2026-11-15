import type { Prisma } from "@prisma/client";
import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";
import {
  EXCHANGE_OFFER_STATUS,
  LISTING_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  type ExchangeOfferStatus,
  type ListingStatus,
} from "@/lib/constants";
import {
  assertExchangeOfferTransition,
  assertListingTransition,
} from "@/lib/listing-state";
import { prisma } from "@/lib/prisma";
import { validateCreateExchangeOffer } from "./validation";

export class ExchangeError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function exchangeErrorResponse(error: unknown) {
  const response =
    error instanceof ExchangeError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

const EXCHANGE_OFFER_SELECT = {
  id: true,
  targetListingId: true,
  offeredListingId: true,
  proposerId: true,
  receiverId: true,
  cashTopUp: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  targetListing: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      allowExchange: true,
      imagesJson: true,
      sellerId: true,
    },
  },
  offeredListing: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      allowExchange: true,
      imagesJson: true,
      sellerId: true,
    },
  },
  proposer: {
    select: {
      id: true,
      fullName: true,
      shop: { select: { name: true, slug: true } },
    },
  },
  receiver: {
    select: {
      id: true,
      fullName: true,
      shop: { select: { name: true, slug: true } },
    },
  },
  transaction: { select: { id: true, status: true } },
} satisfies Prisma.ExchangeOfferSelect;

export type ExchangeOfferDTO = Prisma.ExchangeOfferGetPayload<{
  select: typeof EXCHANGE_OFFER_SELECT;
}>;

export async function parseExchangeOfferInput(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ExchangeError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ExchangeError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }
  const input = body as Record<string, unknown>;
  const targetListingId =
    typeof input.targetListingId === "string"
      ? input.targetListingId.trim()
      : "";
  const offeredListingId =
    typeof input.offeredListingId === "string"
      ? input.offeredListingId.trim()
      : "";

  if (!targetListingId || !offeredListingId) {
    throw new ExchangeError(
      "VALIDATION_ERROR",
      "Vui lòng chọn đủ thiết bị mục tiêu và thiết bị đem đi đổi.",
      400,
    );
  }

  const cashTopUp =
    input.cashTopUp === undefined || input.cashTopUp === null || input.cashTopUp === ""
      ? 0
      : Number(input.cashTopUp);

  let message: string | null = null;
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== "string") {
      throw new ExchangeError("VALIDATION_ERROR", "Lời nhắn không hợp lệ.", 400);
    }
    const trimmed = input.message.trim();
    if (trimmed.length > 500) {
      throw new ExchangeError("VALIDATION_ERROR", "Lời nhắn tối đa 500 ký tự.", 400);
    }
    message = trimmed || null;
  }

  return { targetListingId, offeredListingId, cashTopUp, message };
}

/** Tạo đề nghị trao đổi mới (cần có sản phẩm ACTIVE của mình đem đổi). */
export async function createExchangeOffer(
  proposerId: string,
  input: {
    targetListingId: string;
    offeredListingId: string;
    cashTopUp: number;
    message: string | null;
  },
) {
  return prisma.$transaction(async (tx) => {
    const [target, offered, existingPending] = await Promise.all([
      tx.listing.findUnique({
        where: { id: input.targetListingId },
        select: { id: true, sellerId: true, status: true, allowExchange: true },
      }),
      tx.listing.findUnique({
        where: { id: input.offeredListingId },
        select: { id: true, sellerId: true, status: true, allowExchange: true },
      }),
      tx.exchangeOffer.findFirst({
        where: {
          targetListingId: input.targetListingId,
          offeredListingId: input.offeredListingId,
          status: EXCHANGE_OFFER_STATUS.PENDING,
        },
        select: { id: true },
      }),
    ]);

    if (!target || !offered) {
      throw new ExchangeError(
        "NOT_FOUND",
        "Không tìm thấy thiết bị mục tiêu hoặc thiết bị đem đổi.",
        404,
      );
    }

    const check = validateCreateExchangeOffer({
      proposerId,
      targetListing: {
        id: target.id,
        sellerId: target.sellerId,
        status: target.status as ListingStatus,
        allowExchange: target.allowExchange,
      },
      offeredListing: {
        id: offered.id,
        sellerId: offered.sellerId,
        status: offered.status as ListingStatus,
        allowExchange: offered.allowExchange,
      },
      cashTopUp: input.cashTopUp,
      hasPendingOffer: Boolean(existingPending),
    });

    if (!check.valid) {
      const status =
        check.code === "FORBIDDEN" ? 403 : check.code === "CONFLICT" ? 409 : 400;
      throw new ExchangeError(check.code, check.message, status);
    }

    return tx.exchangeOffer.create({
      data: {
        targetListingId: target.id,
        offeredListingId: offered.id,
        proposerId,
        receiverId: target.sellerId,
        cashTopUp: input.cashTopUp,
        message: input.message,
        status: EXCHANGE_OFFER_STATUS.PENDING,
      },
      select: EXCHANGE_OFFER_SELECT,
    });
  });
}

/** Danh sách đề nghị trao đổi đã gửi (sent) hoặc đã nhận (received). */
export async function listExchangeOffers(
  userId: string,
  box: "sent" | "received" | "all" = "all",
) {
  const where: Prisma.ExchangeOfferWhereInput =
    box === "sent"
      ? { proposerId: userId }
      : box === "received"
        ? { receiverId: userId }
        : { OR: [{ proposerId: userId }, { receiverId: userId }] };

  return prisma.exchangeOffer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: EXCHANGE_OFFER_SELECT,
  });
}

/** Người nhận đồng ý trao đổi -> khóa đồng thời cả 2 thiết bị & sinh Transaction EXCHANGE. */
export async function acceptExchangeOffer(receiverId: string, offerId: string) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.exchangeOffer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        proposerId: true,
        receiverId: true,
        status: true,
        targetListingId: true,
        offeredListingId: true,
        targetListing: { select: { status: true } },
        offeredListing: { select: { status: true } },
        transaction: { select: { id: true } },
      },
    });

    if (!offer) {
      throw new ExchangeError("NOT_FOUND", "Không tìm thấy đề nghị trao đổi.", 404);
    }
    if (offer.receiverId !== receiverId) {
      throw new ExchangeError(
        "FORBIDDEN",
        "Chỉ chủ thiết bị mục tiêu mới được chấp nhận đề nghị này.",
        403,
      );
    }
    if (offer.transaction) {
      throw new ExchangeError("CONFLICT", "Đề nghị này đã tạo giao dịch.", 409);
    }

    try {
      assertExchangeOfferTransition(
        offer.status as ExchangeOfferStatus,
        EXCHANGE_OFFER_STATUS.ACCEPTED,
      );
      assertListingTransition(
        offer.targetListing.status as ListingStatus,
        LISTING_STATUS.IN_TRANSACTION,
      );
      assertListingTransition(
        offer.offeredListing.status as ListingStatus,
        LISTING_STATUS.IN_TRANSACTION,
      );
    } catch {
      throw new ExchangeError(
        "CONFLICT",
        "Đề nghị hoặc một trong hai thiết bị không còn ở trạng thái sẵn sàng.",
        409,
      );
    }

    const lockTarget = await tx.listing.updateMany({
      where: { id: offer.targetListingId, status: LISTING_STATUS.ACTIVE },
      data: { status: LISTING_STATUS.IN_TRANSACTION },
    });
    const lockOffered = await tx.listing.updateMany({
      where: { id: offer.offeredListingId, status: LISTING_STATUS.ACTIVE },
      data: { status: LISTING_STATUS.IN_TRANSACTION },
    });

    if (lockTarget.count !== 1 || lockOffered.count !== 1) {
      throw new ExchangeError(
        "CONFLICT",
        "Thiết bị vừa chuyển trạng thái. Không thể khóa giao dịch.",
        409,
      );
    }

    await tx.exchangeOffer.update({
      where: { id: offer.id },
      data: { status: EXCHANGE_OFFER_STATUS.ACCEPTED },
    });

    await tx.exchangeOffer.updateMany({
      where: {
        id: { not: offer.id },
        status: EXCHANGE_OFFER_STATUS.PENDING,
        OR: [
          { targetListingId: offer.targetListingId },
          { offeredListingId: offer.targetListingId },
          { targetListingId: offer.offeredListingId },
          { offeredListingId: offer.offeredListingId },
        ],
      },
      data: { status: EXCHANGE_OFFER_STATUS.REJECTED },
    });

    return tx.transaction.create({
      data: {
        type: TRANSACTION_TYPE.EXCHANGE,
        listingId: offer.targetListingId,
        secondaryListingId: offer.offeredListingId,
        buyerId: offer.proposerId,
        sellerId: offer.receiverId,
        exchangeOfferId: offer.id,
        status: TRANSACTION_STATUS.IN_PROGRESS,
      },
      select: { id: true, status: true, type: true },
    });
  });
}

/** Người nhận từ chối hoặc người đề nghị hủy đề nghị trao đổi PENDING. */
export async function updateExchangeOfferStatus(
  actorId: string,
  offerId: string,
  action: "reject" | "cancel",
) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.exchangeOffer.findUnique({
      where: { id: offerId },
      select: { id: true, proposerId: true, receiverId: true, status: true },
    });
    if (!offer) {
      throw new ExchangeError("NOT_FOUND", "Không tìm thấy đề nghị trao đổi.", 404);
    }

    if (action === "reject" && offer.receiverId !== actorId) {
      throw new ExchangeError(
        "FORBIDDEN",
        "Chỉ người nhận đề nghị mới có quyền từ chối.",
        403,
      );
    }
    if (action === "cancel" && offer.proposerId !== actorId) {
      throw new ExchangeError(
        "FORBIDDEN",
        "Chỉ người gửi đề nghị mới có quyền hủy.",
        403,
      );
    }

    const nextStatus =
      action === "reject"
        ? EXCHANGE_OFFER_STATUS.REJECTED
        : EXCHANGE_OFFER_STATUS.CANCELLED;

    try {
      assertExchangeOfferTransition(
        offer.status as ExchangeOfferStatus,
        nextStatus,
      );
    } catch {
      throw new ExchangeError(
        "CONFLICT",
        "Chỉ xử lý được đề nghị đang chờ phản hồi (PENDING).",
        409,
      );
    }

    return tx.exchangeOffer.update({
      where: { id: offer.id },
      data: { status: nextStatus },
      select: EXCHANGE_OFFER_SELECT,
    });
  });
}

/** Lấy danh sách thiết bị ACTIVE của user để chọn làm máy đem đi đổi. */
export async function listMyExchangeableListings(userId: string) {
  return prisma.listing.findMany({
    where: { sellerId: userId, status: LISTING_STATUS.ACTIVE },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, price: true, condition: true },
  });
}
