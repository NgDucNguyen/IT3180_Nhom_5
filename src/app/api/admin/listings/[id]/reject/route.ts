import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  adminErrorResponse,
  moderateListingByAdmin,
} from "@/features/admin/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    const response = ok(await moderateListingByAdmin(id, "reject"));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
