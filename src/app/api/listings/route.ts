import type { NextRequest } from "next/server";
import { requireSeller, requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { ListingError, listingErrorResponse, listingResponse } from "@/features/listing/errors";
import { createListing, getSellerListings } from "@/features/listing/service";
import { readListingBody, validateListingInput } from "@/features/listing/validation";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireSeller(request);
    const input = validateListingInput(await readListingBody(request));
    return listingResponse(await createListing(user.id, input), 201);
  } catch (error) {
    return listingErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const params = request.nextUrl.searchParams;
    if (params.get("mine") !== "true") throw new ListingError("VALIDATION_ERROR", "Dùng mine=true để xem tin đăng của bạn.", 400);
    const sellerId = params.get("sellerId");
    if (sellerId && sellerId !== user.id) throw new ListingError("FORBIDDEN", "Bạn chỉ được xem danh sách tin của mình.", 403);
    return listingResponse(await getSellerListings(user.id, params));
  } catch (error) {
    return listingErrorResponse(error);
  }
}
