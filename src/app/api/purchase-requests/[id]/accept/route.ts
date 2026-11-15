import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  acceptPurchaseRequest,
  transactionErrorResponse,
} from "@/features/transaction/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    const response = ok(await acceptPurchaseRequest(user.id, id), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return transactionErrorResponse(error);
  }
}
