import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { cartErrorResponse } from "@/features/cart/errors";
import { removeFromCart } from "@/features/cart/service";

interface CartItemRouteContext {
  params: Promise<{ listingId: string }>;
}

export async function DELETE(
  request: NextRequest,
  context: CartItemRouteContext,
) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { listingId } = await context.params;
    const response = ok(await removeFromCart(user.id, listingId));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return cartErrorResponse(error);
  }
}
