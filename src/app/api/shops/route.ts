import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { shopErrorResponse } from "@/features/shop/errors";
import { listPublicShops } from "@/features/shop/service";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    return ok(await listPublicShops(q));
  } catch (error) {
    return shopErrorResponse(error);
  }
}
