import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  exchangeErrorResponse,
  updateExchangeOfferStatus,
} from "@/features/exchange/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    const response = ok(await updateExchangeOfferStatus(user.id, id, "reject"));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return exchangeErrorResponse(error);
  }
}
