import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import {
  adminErrorResponse,
  listAdminUsers,
} from "@/features/admin/service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const response = ok(await listAdminUsers());
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
