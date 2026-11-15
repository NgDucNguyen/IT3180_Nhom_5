import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { isUserStatus } from "@/lib/constants";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  AdminReportError,
  adminErrorResponse,
  updateUserStatusByAdmin,
} from "@/features/admin/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const admin = await requireAdmin(request);
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const status = body && typeof body.status === "string" ? body.status : "";
    if (!isUserStatus(status)) {
      throw new AdminReportError("VALIDATION_ERROR", "Trạng thái tài khoản không hợp lệ.", 400);
    }

    const response = ok(await updateUserStatusByAdmin(admin.id, id, status));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
