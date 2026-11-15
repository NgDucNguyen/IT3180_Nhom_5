import { AuthError } from "./errors";
import { isValidPhoneNumber } from "./phone";

export async function readAuthInput(request: Request, register = false) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AuthError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AuthError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }
  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError("VALIDATION_ERROR", "Email không hợp lệ.", 400);
  }
  if (!password || Buffer.byteLength(password, "utf8") > 72 || (register && password.length < 8)) {
    throw new AuthError("VALIDATION_ERROR", "Mật khẩu đăng ký cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.", 400);
  }
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (register && (fullName.length < 2 || fullName.length > 100)) {
    throw new AuthError("VALIDATION_ERROR", "Họ tên cần từ 2 đến 100 ký tự.", 400);
  }
  if (register && ((input.phone !== undefined && typeof input.phone !== "string")
    || (phone && !isValidPhoneNumber(phone)))) {
    throw new AuthError("VALIDATION_ERROR", "Số điện thoại không hợp lệ.", 400);
  }
  return { email, password, fullName, phone: phone || null };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  // Next.js có thể chuẩn hóa URL nội bộ thành localhost dù trình duyệt dùng 127.0.0.1.
  // Host là địa chỉ đích trình duyệt gửi tới; không tin X-Forwarded-Host tùy ý.
  const expectedOrigin = `${url.protocol}//${request.headers.get("host") ?? url.host}`;
  if (request.headers.get("sec-fetch-site") === "cross-site"
    || (origin && origin !== expectedOrigin)) {
    throw new AuthError("FORBIDDEN", "Nguồn gửi yêu cầu không được phép.", 403);
  }
}
