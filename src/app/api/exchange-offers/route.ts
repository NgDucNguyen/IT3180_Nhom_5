import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import {
  createExchangeOffer,
  exchangeErrorResponse,
  listExchangeOffers,
  listMyExchangeableListings,
  parseExchangeOfferInput,
} from "@/features/exchange/service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const params = request.nextUrl.searchParams;
    const includeOwn = params.get("includeOwn") === "true";
    const boxParam = params.get("box");
    const box =
      boxParam === "sent" || boxParam === "received" ? boxParam : "all";

    const [offers, ownListings] = await Promise.all([
      listExchangeOffers(user.id, box),
      includeOwn ? listMyExchangeableListings(user.id) : Promise.resolve(undefined),
    ]);

    const response = ok(
      includeOwn ? { offers, ownListings } : offers,
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return exchangeErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const input = await parseExchangeOfferInput(request);
    const response = ok(await createExchangeOffer(user.id, input), 201);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return exchangeErrorResponse(error);
  }
}
