import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { USER_STATUS } from "@/lib/constants";
import { createSessionToken, PUBLIC_USER_SELECT, setSessionCookie } from "@/lib/auth";
import { AuthError, authErrorResponse } from "@/features/auth/errors";
import { assertSameOrigin, readAuthInput } from "@/features/auth/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { email, password } = await readAuthInput(request);
    const account = await prisma.user.findUnique({
      where: { email }, select: { ...PUBLIC_USER_SELECT, passwordHash: true },
    });
    if (!account || !(await compare(password, account.passwordHash))) {
      throw new AuthError("UNAUTHENTICATED", "Email hoặc mật khẩu không đúng.", 401);
    }
    if (account.status !== USER_STATUS.ACTIVE) {
      throw new AuthError("FORBIDDEN", "Tài khoản đã bị khóa.", 403);
    }
    const { passwordHash: omitted, ...user } = account;
    void omitted;
    const response = ok(user);
    setSessionCookie(response, createSessionToken(user.id));
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
