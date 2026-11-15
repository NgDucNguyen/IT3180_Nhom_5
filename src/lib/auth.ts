import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES, USER_STATUS } from "@/lib/constants";
import { AuthError } from "@/features/auth/errors";

export const AUTH_COOKIE_NAME = "electroswap_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const ISSUER = "electroswap";
const AUDIENCE = "electroswap-web";

export const PUBLIC_USER_SELECT = {
  id: true, email: true, fullName: true, phone: true, avatarUrl: true,
  role: true, status: true, createdAt: true, updatedAt: true,
} as const;

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || Buffer.byteLength(value) < 32) {
    throw new Error("JWT_SECRET phải có ít nhất 32 byte.");
  }
  return value;
}

function sign(value: string): Buffer {
  return createHmac("sha256", secret()).update(value).digest();
}

export function assertAuthConfigured(): void {
  secret();
}

export function createSessionToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: userId, iss: ISSUER, aud: AUDIENCE, iat: now, exp: now + SESSION_MAX_AGE,
  })).toString("base64url");
  const value = `${header}.${payload}`;
  return `${value}.${sign(value).toString("base64url")}`;
}

export function verifySessionToken(token: string): string | null {
  // Lỗi cấu hình phải được phát hiện, không bị hiểu nhầm thành phiên hết hạn.
  secret();
  if (token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  const expected = sign(`${headerPart}.${payloadPart}`);
  const signature = Buffer.from(signaturePart, "base64url");
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
  try {
    const header: unknown = JSON.parse(Buffer.from(headerPart, "base64url").toString());
    const payload: unknown = JSON.parse(Buffer.from(payloadPart, "base64url").toString());
    if (!header || typeof header !== "object" || !("alg" in header) || header.alg !== "HS256"
      || !("typ" in header) || header.typ !== "JWT") return null;
    if (!payload || typeof payload !== "object") return null;
    const claims = payload as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.sub !== "string" || !claims.sub || claims.iss !== ISSUER || claims.aud !== AUDIENCE
      || typeof claims.exp !== "number" || !Number.isSafeInteger(claims.exp) || claims.exp <= now
      || typeof claims.iat !== "number" || !Number.isSafeInteger(claims.iat) || claims.iat > now
      || claims.exp <= claims.iat || claims.exp - claims.iat > SESSION_MAX_AGE) return null;
    return claims.sub;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: SESSION_MAX_AGE,
  });
  response.headers.set("Cache-Control", "no-store");
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 0, expires: new Date(0),
  });
  response.headers.set("Cache-Control", "no-store");
}

export async function getCurrentUser(request?: NextRequest) {
  const token = request
    ? request.cookies.get(AUTH_COOKIE_NAME)?.value
    : (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const id = verifySessionToken(token);
  if (!id) return null;
  // Đọc lại DB để khóa tài khoản hoặc đổi quyền có hiệu lực ngay với phiên cũ.
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT });
  if (!user) return null;
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AuthError("FORBIDDEN", "Tài khoản đã bị khóa.", 403);
  }
  return user;
}

export async function requireUser(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) throw new AuthError("UNAUTHENTICATED", "Vui lòng đăng nhập.", 401);
  return user;
}

export async function requireAdmin(request?: NextRequest) {
  const user = await requireUser(request);
  if (user.role !== ROLES.ADMIN) throw new AuthError("FORBIDDEN", "Bạn không có quyền quản trị.", 403);
  return user;
}
