import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { cartErrorResponse } from "@/features/cart/errors";
import {
  addToCart,
  clearCart,
  getUserCart,
  parseAddCartInput,
} from "@/features/cart/service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const response = ok(await getUserCart(user.id));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return cartErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const listingId = await parseAddCartInput(request);
    const response = ok(await addToCart(user.id, listingId), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return cartErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const onlyUnavailable =
      new URL(request.url).searchParams.get("onlyUnavailable") === "true";
    const response = ok(await clearCart(user.id, onlyUnavailable));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return cartErrorResponse(error);
  }
}
