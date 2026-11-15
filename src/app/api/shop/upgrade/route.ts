import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { shopErrorResponse } from "@/features/shop/errors";
import { upgradeUserToShop } from "@/features/shop/service";
import { readShopInput } from "@/features/shop/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = await readShopInput(request);
    const response = ok(await upgradeUserToShop(user.id, input), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return shopErrorResponse(error);
  }
}
