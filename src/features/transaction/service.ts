import type { Prisma } from "@prisma/client";
import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";
import {
  LISTING_STATUS,
  PURCHASE_REQUEST_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  type ListingStatus,
  type PurchaseRequestStatus,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/constants";
import {
  assertListingTransition,
  assertTransactionTransition,
} from "@/lib/listing-state";
import { prisma } from "@/lib/prisma";
import {
  applyConfirmation,
  checkAcceptPurchaseRequest,
  checkCanActOnTransaction,
  checkRejectPurchaseRequest,
  getListingStatusOnComplete,
  hasAlreadyConfirmed,
} from "./rules";

export class TransactionServiceError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function transactionErrorResponse(error: unknown) {
  const response =
    error instanceof TransactionServiceError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

const TRANSACTION_SELECT = {
  id: true,
  type: true,
  listingId: true,
  secondaryListingId: true,
  buyerId: true,
  sellerId: true,
  purchaseRequestId: true,
  exchangeOfferId: true,
  buyerConfirmed: true,
  sellerConfirmed: true,
  status: true,
  completedAt: true,
  createdAt: true,
  listing: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      imagesJson: true,
    },
  },
  secondaryListing: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      imagesJson: true,
    },
  },
  buyer: {
    select: { id: true, fullName: true, phone: true },
  },
  seller: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      shop: { select: { name: true, slug: true, isVerified: true } },
    },
  },
  purchaseRequest: {
    select: { id: true, offeredPrice: true, message: true },
  },
  exchangeOffer: {
    select: { id: true, cashTopUp: true, message: true },
  },
} satisfies Prisma.TransactionSelect;

export type TransactionDTO = Prisma.TransactionGetPayload<{
  select: typeof TRANSACTION_SELECT;
}>;

/** Người bán chấp nhận yêu cầu mua -> khóa tin & tạo Transaction IN_PROGRESS. */
export async function acceptPurchaseRequest(
  sellerUserId: string,
  requestId: string,
) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.purchaseRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        listingId: true,
        buyerId: true,
        status: true,
        listing: { select: { id: true, sellerId: true, status: true } },
        transaction: { select: { id: true } },
      },
    });

    if (!req) {
      throw new TransactionServiceError(
        "NOT_FOUND",
        "Không tìm thấy yêu cầu mua.",
        404,
      );
    }

    const check = checkAcceptPurchaseRequest({
      actorId: sellerUserId,
      listingSellerId: req.listing.sellerId,
      requestStatus: req.status as PurchaseRequestStatus,
      listingStatus: req.listing.status as ListingStatus,
    });

    if (!check.ok) {
      throw new TransactionServiceError(check.code, check.message, check.status);
    }
    if (req.transaction) {
      throw new TransactionServiceError(
        "CONFLICT",
        "Yêu cầu mua này đã phát sinh giao dịch.",
        409,
      );
    }

    const lockedListing = await tx.listing.updateMany({
      where: { id: req.listingId, status: LISTING_STATUS.ACTIVE },
      data: { status: LISTING_STATUS.IN_TRANSACTION },
    });
    if (lockedListing.count !== 1) {
      throw new TransactionServiceError(
        "CONFLICT",
        "Sản phẩm vừa chuyển sang trạng thái khác. Vui lòng tải lại.",
        409,
      );
    }

    await tx.purchaseRequest.update({
      where: { id: req.id },
      data: { status: PURCHASE_REQUEST_STATUS.ACCEPTED },
    });

    // Từ chối các yêu cầu PENDING khác trên cùng máy để tránh kẹt chờ vô hạn.
    await tx.purchaseRequest.updateMany({
      where: {
        listingId: req.listingId,
        id: { not: req.id },
        status: PURCHASE_REQUEST_STATUS.PENDING,
      },
      data: { status: PURCHASE_REQUEST_STATUS.REJECTED },
    });

    return tx.transaction.create({
      data: {
        type: TRANSACTION_TYPE.PURCHASE,
        listingId: req.listingId,
        buyerId: req.buyerId,
        sellerId: req.listing.sellerId,
        purchaseRequestId: req.id,
        status: TRANSACTION_STATUS.IN_PROGRESS,
      },
      select: TRANSACTION_SELECT,
    });
  });
}

/** Người bán từ chối yêu cầu mua đang PENDING. */
export async function rejectPurchaseRequest(
  sellerUserId: string,
  requestId: string,
) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.purchaseRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        listing: { select: { sellerId: true } },
      },
    });

    if (!req) {
      throw new TransactionServiceError(
        "NOT_FOUND",
        "Không tìm thấy yêu cầu mua.",
        404,
      );
    }

    const check = checkRejectPurchaseRequest({
      actorId: sellerUserId,
      listingSellerId: req.listing.sellerId,
      requestStatus: req.status as PurchaseRequestStatus,
    });
    if (!check.ok) {
      throw new TransactionServiceError(check.code, check.message, check.status);
    }

    return tx.purchaseRequest.update({
      where: { id: req.id },
      data: { status: PURCHASE_REQUEST_STATUS.REJECTED },
      select: { id: true, status: true },
    });
  });
}

/** Lịch sử & đơn giao dịch của user theo vai trò buyer, seller hoặc all. */
export async function listUserTransactions(
  userId: string,
  role: "all" | "buyer" | "seller" = "all",
) {
  const where: Prisma.TransactionWhereInput =
    role === "buyer"
      ? { buyerId: userId }
      : role === "seller"
        ? { sellerId: userId }
        : { OR: [{ buyerId: userId }, { sellerId: userId }] };

  return prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: TRANSACTION_SELECT,
  });
}

function assertParticipantAndInProgress(
  actorId: string,
  txRow: {
    buyerId: string;
    sellerId: string;
    status: string;
    type: string;
  },
) {
  if (txRow.type === TRANSACTION_TYPE.PURCHASE) {
    const check = checkCanActOnTransaction({
      actorId,
      buyerId: txRow.buyerId,
      sellerId: txRow.sellerId,
      status: txRow.status as TransactionStatus,
      type: TRANSACTION_TYPE.PURCHASE,
    });
    if (!check.ok) {
      throw new TransactionServiceError(check.code, check.message, check.status);
    }
    return;
  }

  if (actorId !== txRow.buyerId && actorId !== txRow.sellerId) {
    throw new TransactionServiceError(
      "FORBIDDEN",
      "Bạn không thuộc giao dịch này.",
      403,
    );
  }
  if (txRow.status !== TRANSACTION_STATUS.IN_PROGRESS) {
    throw new TransactionServiceError(
      "CONFLICT",
      "Giao dịch không còn ở trạng thái đang thực hiện.",
      409,
    );
  }
}

/** Một bên xác nhận hoàn tất giao dịch; đủ 2 bên -> COMPLETED + SOLD/EXCHANGED. */
export async function confirmTransaction(actorId: string, transactionId: string) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: {
        ...TRANSACTION_SELECT,
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            imagesJson: true,
          },
        },
        secondaryListing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            imagesJson: true,
          },
        },
      },
    });

    if (!row) {
      throw new TransactionServiceError(
        "NOT_FOUND",
        "Không tìm thấy giao dịch.",
        404,
      );
    }

    assertParticipantAndInProgress(actorId, row);

    if (
      hasAlreadyConfirmed({
        actorId,
        buyerId: row.buyerId,
        buyerConfirmed: row.buyerConfirmed,
        sellerConfirmed: row.sellerConfirmed,
      })
    ) {
      return row;
    }

    const next = applyConfirmation({
      actorId,
      buyerId: row.buyerId,
      sellerId: row.sellerId,
      buyerConfirmed: row.buyerConfirmed,
      sellerConfirmed: row.sellerConfirmed,
    });

    const nextStatus = next.isReady
      ? TRANSACTION_STATUS.COMPLETED
      : TRANSACTION_STATUS.IN_PROGRESS;

    if (next.isReady) {
      assertTransactionTransition(
        row.status as TransactionStatus,
        TRANSACTION_STATUS.COMPLETED,
      );
      const nextListingStatus = getListingStatusOnComplete(
        row.type as TransactionType,
      );
      assertListingTransition(
        row.listing.status as ListingStatus,
        nextListingStatus,
      );
      await tx.listing.update({
        where: { id: row.listingId },
        data: { status: nextListingStatus },
      });

      if (row.secondaryListingId && row.secondaryListing) {
        assertListingTransition(
          row.secondaryListing.status as ListingStatus,
          nextListingStatus,
        );
        await tx.listing.update({
          where: { id: row.secondaryListingId },
          data: { status: nextListingStatus },
        });
      }
    }

    return tx.transaction.update({
      where: { id: row.id },
      data: {
        buyerConfirmed: next.buyerConfirmed,
        sellerConfirmed: next.sellerConfirmed,
        status: nextStatus,
        ...(next.isReady ? { completedAt: new Date() } : {}),
      },
      select: TRANSACTION_SELECT,
    });
  });
}

/** Hủy giao dịch đang IN_PROGRESS -> CANCELLED và mở lại thiết bị về ACTIVE. */
export async function cancelTransaction(actorId: string, transactionId: string) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        type: true,
        status: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        secondaryListingId: true,
        listing: { select: { status: true } },
        secondaryListing: { select: { status: true } },
      },
    });

    if (!row) {
      throw new TransactionServiceError(
        "NOT_FOUND",
        "Không tìm thấy giao dịch.",
        404,
      );
    }

    assertParticipantAndInProgress(actorId, row);
    assertTransactionTransition(
      row.status as TransactionStatus,
      TRANSACTION_STATUS.CANCELLED,
    );

    if (row.listing.status === LISTING_STATUS.IN_TRANSACTION) {
      assertListingTransition(
        row.listing.status as ListingStatus,
        LISTING_STATUS.ACTIVE,
      );
      await tx.listing.update({
        where: { id: row.listingId },
        data: { status: LISTING_STATUS.ACTIVE },
      });
    }

    if (
      row.secondaryListingId &&
      row.secondaryListing?.status === LISTING_STATUS.IN_TRANSACTION
    ) {
      assertListingTransition(
        row.secondaryListing.status as ListingStatus,
        LISTING_STATUS.ACTIVE,
      );
      await tx.listing.update({
        where: { id: row.secondaryListingId },
        data: { status: LISTING_STATUS.ACTIVE },
      });
    }

    return tx.transaction.update({
      where: { id: row.id },
      data: { status: TRANSACTION_STATUS.CANCELLED },
      select: TRANSACTION_SELECT,
    });
  });
}
