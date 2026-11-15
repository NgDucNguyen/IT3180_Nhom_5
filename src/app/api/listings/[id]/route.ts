import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { listingErrorResponse, listingResponse } from "@/features/listing/errors";
import { editListing } from "@/features/listing/service";
import { readListingBody, validateListingInput } from "@/features/listing/validation";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    const input = validateListingInput(await readListingBody(request), true);
    return listingResponse(await editListing(user.id, id, input));
  } catch (error) {
    return listingErrorResponse(error);
  }
}
