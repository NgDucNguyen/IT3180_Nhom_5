import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { purchaseErrorResponse } from "@/features/purchase/errors";
import {
  createPurchaseRequest,
  listPurchaseRequests,
  parseCreatePurchaseRequestInput,
} from "@/features/purchase/service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const boxParam = request.nextUrl.searchParams.get("box");
    const box = boxParam === "received" ? "received" : "sent";
    const response = ok(await listPurchaseRequests(user.id, box));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return purchaseErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = await parseCreatePurchaseRequestInput(request);
    const response = ok(await createPurchaseRequest(user.id, input), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return purchaseErrorResponse(error);
  }
}
