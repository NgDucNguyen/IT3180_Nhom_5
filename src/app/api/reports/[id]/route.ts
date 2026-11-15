import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { isReportStatus } from "@/lib/constants";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  AdminReportError,
  adminErrorResponse,
  resolveReportByAdmin,
} from "@/features/admin/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body || typeof body !== "object") {
      throw new AdminReportError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
    }
    const status = typeof body.status === "string" ? body.status : "";
    if (!isReportStatus(status)) {
      throw new AdminReportError("VALIDATION_ERROR", "Trạng thái báo cáo không hợp lệ.", 400);
    }
    const adminNote =
      typeof body.adminNote === "string" ? body.adminNote.trim().slice(0, 500) : null;
    const rejectListing = body.rejectListing === true;

    const response = ok(
      await resolveReportByAdmin(id, { status, adminNote, rejectListing }),
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
