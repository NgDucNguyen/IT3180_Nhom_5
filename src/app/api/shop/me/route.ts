import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireSeller, requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { ShopError, shopErrorResponse } from "@/features/shop/errors";
import { getMyShop, updateMyShop } from "@/features/shop/service";
import { readShopInput } from "@/features/shop/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const shop = await getMyShop(user.id);
    if (!shop) {
      throw new ShopError("NOT_FOUND", "Tài khoản chưa nâng cấp thành Shop.", 404);
    }
    const response = ok(shop);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return shopErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireSeller(request);
    const input = await readShopInput(request);
    const response = ok(await updateMyShop(user.id, input));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return shopErrorResponse(error);
  }
}
