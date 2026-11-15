import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin, requireUser } from "@/lib/auth";
import { isReportStatus } from "@/lib/constants";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  adminErrorResponse,
  createListingReport,
  listAdminReports,
  parseCreateReportInput,
} from "@/features/admin/service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam && isReportStatus(statusParam) ? statusParam : undefined;
    const response = ok(await listAdminReports(status));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = await parseCreateReportInput(request);
    const response = ok(await createListingReport(user.id, input), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
