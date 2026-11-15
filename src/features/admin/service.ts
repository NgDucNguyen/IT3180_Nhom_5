import type { Prisma } from "@prisma/client";
import { AuthError } from "@/features/auth/errors";
import { fail, handleApiError, type ApiErrorCode } from "@/lib/api-response";
import {
  LISTING_STATUS,
  REPORT_STATUS,
  ROLES,
  USER_STATUS,
  type ListingStatus,
  type ReportStatus,
  type UserStatus,
} from "@/lib/constants";
import { assertListingTransition } from "@/lib/listing-state";
import { prisma } from "@/lib/prisma";

export class AdminReportError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function adminErrorResponse(error: unknown) {
  const response =
    error instanceof AdminReportError || error instanceof AuthError
      ? fail(error.code, error.message, error.status)
      : handleApiError(error);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Tạo báo cáo vi phạm cho 1 tin đăng (User đã đăng nhập). */
export async function createListingReport(
  reporterId: string,
  input: { listingId: string; reason: string; description: string | null },
) {
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { id: true, sellerId: true },
  });
  if (!listing) {
    throw new AdminReportError("NOT_FOUND", "Tin đăng không tồn tại.", 404);
  }
  if (listing.sellerId === reporterId) {
    throw new AdminReportError(
      "FORBIDDEN",
      "Bạn không thể tự báo cáo tin đăng của chính mình.",
      403,
    );
  }

  return prisma.report.create({
    data: {
      reporterId,
      listingId: input.listingId,
      reason: input.reason,
      description: input.description,
      status: REPORT_STATUS.PENDING,
    },
    select: {
      id: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      listingId: true,
    },
  });
}

export async function parseCreateReportInput(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AdminReportError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AdminReportError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }
  const input = body as Record<string, unknown>;
  const listingId =
    typeof input.listingId === "string" ? input.listingId.trim() : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (!listingId || !reason || reason.length > 100) {
    throw new AdminReportError(
      "VALIDATION_ERROR",
      "Vui lòng chọn mã tin đăng và lý do báo cáo.",
      400,
    );
  }

  let description: string | null = null;
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== "string") {
      throw new AdminReportError("VALIDATION_ERROR", "Mô tả báo cáo không hợp lệ.", 400);
    }
    const trimmed = input.description.trim();
    if (trimmed.length > 1000) {
      throw new AdminReportError("VALIDATION_ERROR", "Mô tả tối đa 1000 ký tự.", 400);
    }
    description = trimmed || null;
  }

  return { listingId, reason, description };
}

/** Danh sách tin đăng cho Admin kiểm duyệt. */
export async function listAdminListings(status?: ListingStatus) {
  return prisma.listing.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      price: true,
      condition: true,
      status: true,
      allowExchange: true,
      createdAt: true,
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      seller: {
        select: {
          id: true,
          fullName: true,
          email: true,
          shop: { select: { id: true, name: true, slug: true, isVerified: true } },
        },
      },
    },
  });
}

/** Admin duyệt (ACTIVE) hoặc từ chối (REJECTED) một tin đăng. */
export async function moderateListingByAdmin(
  listingId: string,
  action: "approve" | "reject",
) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });
    if (!listing) {
      throw new AdminReportError("NOT_FOUND", "Không tìm thấy tin đăng.", 404);
    }

    const targetStatus =
      action === "approve" ? LISTING_STATUS.ACTIVE : LISTING_STATUS.REJECTED;
    try {
      assertListingTransition(listing.status as ListingStatus, targetStatus);
    } catch {
      throw new AdminReportError(
        "CONFLICT",
        `Không thể chuyển trạng thái tin từ ${listing.status} sang ${targetStatus}.`,
        409,
      );
    }

    return tx.listing.update({
      where: { id: listingId },
      data: { status: targetStatus },
      select: { id: true, title: true, status: true },
    });
  });
}

/** Admin xem danh sách báo cáo vi phạm. */
export async function listAdminReports(status?: ReportStatus) {
  return prisma.report.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      reason: true,
      description: true,
      status: true,
      adminNote: true,
      createdAt: true,
      reporter: { select: { id: true, fullName: true, email: true } },
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          sellerId: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              shop: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });
}

/** Admin xử lý báo cáo (RESOLVED / DISMISSED) + tùy chọn gỡ tin vi phạm. */
export async function resolveReportByAdmin(
  reportId: string,
  input: { status: ReportStatus; adminNote: string | null; rejectListing?: boolean },
) {
  if (
    input.status !== REPORT_STATUS.RESOLVED &&
    input.status !== REPORT_STATUS.DISMISSED
  ) {
    throw new AdminReportError(
      "VALIDATION_ERROR",
      "Trạng thái xử lý báo cáo phải là RESOLVED hoặc DISMISSED.",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        listingId: true,
        listing: { select: { status: true } },
      },
    });
    if (!report) {
      throw new AdminReportError("NOT_FOUND", "Không tìm thấy báo cáo.", 404);
    }

    if (
      input.rejectListing &&
      (report.listing.status === LISTING_STATUS.PENDING ||
        report.listing.status === LISTING_STATUS.ACTIVE ||
        report.listing.status === LISTING_STATUS.HIDDEN)
    ) {
      await tx.listing.update({
        where: { id: report.listingId },
        data: { status: LISTING_STATUS.REJECTED },
      });
    }

    return tx.report.update({
      where: { id: reportId },
      data: {
        status: input.status,
        adminNote: input.adminNote,
      },
      select: { id: true, status: true, adminNote: true, listingId: true },
    });
  });
}

/** Admin xem danh sách người dùng và Shop trên sàn (không bao giờ trả passwordHash). */
export async function listAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          isVerified: true,
        },
      },
      _count: {
        select: { listings: true, purchaseRequests: true },
      },
    } satisfies Prisma.UserSelect,
  });
}

/** Admin khóa hoặc mở khóa tài khoản User / Seller. */
export async function updateUserStatusByAdmin(
  adminId: string,
  targetUserId: string,
  nextStatus: UserStatus,
) {
  if (
    nextStatus !== USER_STATUS.ACTIVE &&
    nextStatus !== USER_STATUS.LOCKED
  ) {
    throw new AdminReportError("VALIDATION_ERROR", "Trạng thái không hợp lệ.", 400);
  }
  if (adminId === targetUserId) {
    throw new AdminReportError(
      "FORBIDDEN",
      "Không thể tự khóa tài khoản Quản trị viên đang đăng nhập.",
      403,
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });
  if (!target) {
    throw new AdminReportError("NOT_FOUND", "Không tìm thấy người dùng.", 404);
  }
  if (target.role === ROLES.ADMIN) {
    throw new AdminReportError(
      "FORBIDDEN",
      "Không được khóa tài khoản Quản trị viên khác.",
      403,
    );
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { status: nextStatus },
    select: { id: true, fullName: true, status: true },
  });
}

/** Admin gắn/gỡ huy hiệu "Shop Uy Tín" (isVerified). */
export async function setShopVerifiedByAdmin(
  shopId: string,
  isVerified: boolean,
) {
  const existing = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true },
  });
  if (!existing) {
    throw new AdminReportError("NOT_FOUND", "Không tìm thấy Shop.", 404);
  }

  return prisma.shop.update({
    where: { id: shopId },
    data: { isVerified },
    select: { id: true, name: true, slug: true, isVerified: true },
  });
}
