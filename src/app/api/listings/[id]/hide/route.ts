import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/features/auth/validation";
import { listingErrorResponse, listingResponse } from "@/features/listing/errors";
import { toggleListingVisibility } from "@/features/listing/service";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    return listingResponse(await toggleListingVisibility(user.id, id));
  } catch (error) {
    return listingErrorResponse(error);
  }
}
