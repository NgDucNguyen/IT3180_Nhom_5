import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { ROLES, USER_STATUS } from "@/lib/constants";
import { assertAuthConfigured, createSessionToken, PUBLIC_USER_SELECT, setSessionCookie } from "@/lib/auth";
import { AuthError, authErrorResponse } from "@/features/auth/errors";
import { assertSameOrigin, readAuthInput } from "@/features/auth/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { email, password, fullName, phone } = await readAuthInput(request, true);
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new AuthError("CONFLICT", "Email đã được đăng ký.", 409);
    // Kiểm tra cấu hình ký trước khi tạo tài khoản để tránh tạo user nhưng không có phiên.
    assertAuthConfigured();
    const user = await prisma.user.create({
      data: { email, passwordHash: await hash(password, 10), fullName, phone,
        role: ROLES.USER, status: USER_STATUS.ACTIVE },
      select: PUBLIC_USER_SELECT,
    });
    const response = ok(user, 201);
    setSessionCookie(response, createSessionToken(user.id));
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
