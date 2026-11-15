import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { authErrorResponse } from "@/features/auth/errors";

export async function GET(request: NextRequest) {
  try {
    const response = ok(await requireUser(request));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
