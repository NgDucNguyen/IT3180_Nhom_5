import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { isListingStatus } from "@/lib/constants";
import {
  adminErrorResponse,
  listAdminListings,
} from "@/features/admin/service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam && isListingStatus(statusParam) ? statusParam : undefined;
    const response = ok(await listAdminListings(status));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
