import { ok } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth";
import { authErrorResponse } from "@/features/auth/errors";
import { assertSameOrigin } from "@/features/auth/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = ok({ message: "Đã đăng xuất." });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
