import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { ShopError, shopErrorResponse } from "@/features/shop/errors";
import { getShopStorefront } from "@/features/shop/service";

interface ShopRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: ShopRouteContext) {
  try {
    const { slug } = await context.params;
    const storefront = await getShopStorefront(slug);
    if (!storefront) {
      throw new ShopError("NOT_FOUND", "Không tìm thấy cửa hàng.", 404);
    }
    return ok(storefront);
  } catch (error) {
    return shopErrorResponse(error);
  }
}
