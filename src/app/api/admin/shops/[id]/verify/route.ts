import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  AdminReportError,
  adminErrorResponse,
  setShopVerifiedByAdmin,
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
    if (!body || typeof body.isVerified !== "boolean") {
      throw new AdminReportError("VALIDATION_ERROR", "Thiếu giá trị isVerified hợp lệ.", 400);
    }

    const response = ok(await setShopVerifiedByAdmin(id, body.isVerified));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
