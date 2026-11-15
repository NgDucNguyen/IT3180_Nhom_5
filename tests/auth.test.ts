import { randomUUID, createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compare } from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as me } from "@/app/api/auth/me/route";
import { AUTH_COOKIE_NAME, createSessionToken, verifySessionToken, requireAdmin } from "@/lib/auth";
import { ROLES, USER_STATUS } from "@/lib/constants";
import { readAuthInput } from "@/features/auth/validation";

const email = `tv1-${randomUUID()}@example.test`;
const password = "MatKhau123!";
const previousSecret = process.env.JWT_SECRET;
const createdIds: string[] = [];
let userId: string;
let cookie: string;

function request(path: string, body?: unknown, session?: string) {
  return new NextRequest(`http://localhost:3000/api/auth/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(session ? { Cookie: session } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeAll(() => { process.env.JWT_SECRET = randomUUID() + randomUUID(); });
afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

describe.sequential("Auth API tích hợp SQLite", () => {
  it("đăng ký: chuẩn hóa email, bcrypt cost 10, bỏ role từ client, cookie an toàn", async () => {
    const response = await register(request("register", {
      email: ` ${email.toUpperCase()} `, password, fullName: " Thành viên Một ", role: ROLES.ADMIN,
      phone: " +84 912 345 678 ",
    }));
    const body = await response.json();
    if (body.data?.id) createdIds.push(body.data.id);
    expect(response.status).toBe(201);
    expect(body.data).toMatchObject({ email, fullName: "Thành viên Một", role: ROLES.USER, status: USER_STATUS.ACTIVE, phone: "+84 912 345 678" });
    expect(body.data).not.toHaveProperty("passwordHash");
    expect(body.data).not.toHaveProperty("token");
    userId = body.data.id;
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    expect(await compare(password, stored.passwordHash)).toBe(true);
    const setCookie = response.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("Max-Age=604800");
    expect(response.headers.get("cache-control")).toBe("no-store");
    cookie = setCookie.split(";")[0];
  });

  it("email trùng trả 409 và không cấp cookie", async () => {
    const response = await register(request("register", { email, password, fullName: "Tên khác" }));
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("CONFLICT");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it.each([
    { email: "sai-email", password, fullName: "Tên hợp lệ" },
    { email, password: "123456", fullName: "Tên hợp lệ" },
    { email, password: "á".repeat(37), fullName: "Tên hợp lệ" },
    { email, password, fullName: " " },
    { email, password, fullName: "Tên hợp lệ", phone: 123 },
    { email, password, fullName: "Tên hợp lệ", phone: "abc" },
    null,
  ])("đầu vào đăng ký sai trả 400: %j", async (input) => {
    expect((await register(request("register", input))).status).toBe(400);
  });

  it("JSON hỏng trả 400", async () => {
    const response = await register(new Request("http://localhost:3000/api/auth/register", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });

  it.each(["--------", "() () ()", "12-34-56", "1234567890123456", "+84abc12345678", "++84912345678"])(
    "chặn số điện thoại không hợp lệ %s tại API", async (phone) => {
      const response = await register(request("register", { email, password, fullName: "Tên hợp lệ", phone }));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
      expect(response.headers.get("set-cookie")).toBeNull();
    },
  );

  it.each(["12345678", "123456789012345", "+84 912 345 678", "(024) 1234-5678"])(
    "chấp nhận số điện thoại hợp lệ %s", async (phone) => {
      const parsed = await readAuthInput(request("register", { email, password, fullName: "Tên hợp lệ", phone }), true);
      expect(parsed.phone).toBe(phone);
    },
  );

  it.each([undefined, "", "   "])("phone tùy chọn %j được lưu thành null", async (phone) => {
    const parsed = await readAuthInput(request("register", { email, password, fullName: "Tên hợp lệ", phone }), true);
    expect(parsed.phone).toBeNull();
  });

  it("đăng nhập đúng trả user và cookie", async () => {
    const response = await login(request("login", { email, password }));
    expect(response.status).toBe(200);
    expect((await response.json()).data).not.toHaveProperty("passwordHash");
    expect(response.cookies.get(AUTH_COOKIE_NAME)?.value).toBeTruthy();
  });

  it.each(["sai-mat-khau", "123456"])("đăng nhập sai trả 401", async (wrong) => {
    const response = await login(request("login", { email, password: wrong }));
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("email chưa đăng ký trả cùng lỗi 401", async () => {
    const response = await login(request("login", { email: `missing-${email}`, password }));
    expect(response.status).toBe(401);
    expect((await response.json()).error.message).toBe("Email hoặc mật khẩu không đúng.");
  });

  it("me đọc phiên và trả thông tin an toàn", async () => {
    const response = await me(request("me", undefined, cookie));
    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ id: userId, email });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("me thiếu cookie hoặc cookie giả trả 401", async () => {
    expect((await me(request("me"))).status).toBe(401);
    expect((await me(request("me", undefined, `${AUTH_COOKIE_NAME}=invalid`))).status).toBe(401);
  });

  it("JWT sai chữ ký, hết hạn, sai algorithm/audience đều bị từ chối", () => {
    const token = createSessionToken(userId);
    expect(verifySessionToken(token)).toBe(userId);
    expect(verifySessionToken(`${token}x`)).toBeNull();
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
    for (const [alg, aud, exp] of [["HS256", "electroswap-web", now - 1], ["none", "electroswap-web", now + 20], ["HS256", "other", now + 20]] as const) {
      const value = `${encode({ alg, typ: "JWT" })}.${encode({ sub: userId, iss: "electroswap", aud, iat: now - 10, exp })}`;
      const signature = createHmac("sha256", process.env.JWT_SECRET!).update(value).digest("base64url");
      expect(verifySessionToken(`${value}.${signature}`)).toBeNull();
    }
  });

  it("guard admin đọc role hiện tại từ DB", async () => {
    await expect(requireAdmin(request("me", undefined, cookie))).rejects.toMatchObject({ status: 403 });
    await prisma.user.update({ where: { id: userId }, data: { role: ROLES.ADMIN }, select: { id: true } });
    expect((await requireAdmin(request("me", undefined, cookie))).id).toBe(userId);
    await prisma.user.update({ where: { id: userId }, data: { role: ROLES.USER }, select: { id: true } });
  });

  it("khóa tài khoản chặn cả login và phiên đã cấp", async () => {
    await prisma.user.update({ where: { id: userId }, data: { status: USER_STATUS.LOCKED }, select: { id: true } });
    expect((await login(request("login", { email, password }))).status).toBe(403);
    expect((await me(request("me", undefined, cookie))).status).toBe(403);
    await prisma.user.update({ where: { id: userId }, data: { status: USER_STATUS.ACTIVE }, select: { id: true } });
  });

  it("POST từ origin khác bị chặn", async () => {
    for (const handler of [register, login, logout]) {
      const response = await handler(new Request("http://localhost:3000/api/auth/login", {
        method: "POST", headers: { Origin: "https://other.example" }, body: JSON.stringify({ email, password }),
      }));
      expect(response.status).toBe(403);
    }
  });

  it("origin dùng Host thực khi Next.js chuẩn hóa URL nội bộ", async () => {
    const response = await login(new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { Host: "127.0.0.1:3180", Origin: "http://127.0.0.1:3180", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }));
    expect(response.status).toBe(200);
  });

  it("Sec-Fetch-Site cross-site bị chặn kể cả khi không có Origin", async () => {
    const response = await logout(new Request("http://localhost:3000/api/auth/logout", {
      method: "POST", headers: { "Sec-Fetch-Site": "cross-site" },
    }));
    expect(response.status).toBe(403);
  });

  it("logout hết hạn cookie, có thể gọi lại khi chưa đăng nhập", async () => {
    const response = await logout(request("logout", {}, cookie));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(response.cookies.get(AUTH_COOKIE_NAME)?.value).toBe("");
    expect((await me(request("me", undefined, `${AUTH_COOKIE_NAME}=`))).status).toBe(401);
    expect((await logout(request("logout", {}))).status).toBe(200);
  });

  it("phiên của user đã xóa trả 401", async () => {
    expect((await me(request("me", undefined, `${AUTH_COOKIE_NAME}=${createSessionToken("deleted-user")}`))).status).toBe(401);
  });
});
