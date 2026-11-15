import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import {
  listUserTransactions,
  transactionErrorResponse,
} from "@/features/transaction/service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const roleParam = request.nextUrl.searchParams.get("role");
    const role =
      roleParam === "buyer" || roleParam === "seller" ? roleParam : "all";
    const response = ok(await listUserTransactions(user.id, role));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return transactionErrorResponse(error);
  }
}
