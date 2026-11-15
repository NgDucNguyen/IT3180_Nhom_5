"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Container } from "@/components/layout";
import { Button, Card, Input } from "@/components/ui";
import { isValidPhoneNumber } from "@/features/auth/phone";

const DEMO_ACCOUNTS = [
  { email: "admin@nhom5.vn", roleLabel: "Quản trị viên" },
  { email: "an@nhom5.vn", roleLabel: "Người dùng" },
  { email: "binh@nhom5.vn", roleLabel: "Người dùng" },
  { email: "chi@nhom5.vn", roleLabel: "Người dùng" },
] as const;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const phone = String(form.get("phone") ?? "").trim();
      if (register && phone && !isValidPhoneNumber(phone)) {
        setError(
          "Số điện thoại cần có 8–15 chữ số và chỉ dùng dấu +, khoảng trắng, (), - để phân cách.",
        );
        return;
      }
      if (new TextEncoder().encode(password).length > 72) {
        setError("Mật khẩu không được vượt quá 72 byte UTF-8.");
        return;
      }
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(register ? { fullName: form.get("fullName"), phone } : {}),
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          body &&
          typeof body === "object" &&
          "error" in body &&
          body.error &&
          typeof body.error === "object" &&
          "message" in body.error &&
          typeof body.error.message === "string"
            ? body.error.message
            : "Không thể xác thực. Vui lòng thử lại.";
        setError(message);
        return;
      }
      // Điều hướng cố định trong ứng dụng, không nhận URL tùy ý từ người gửi.
      router.replace("/listings");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto w-full max-w-md space-y-5">
          <Card className="rounded-3xl p-6 shadow-sm sm:p-7">
            {/* Thanh chuyển đổi chế độ Đăng nhập / Đăng ký đồng bộ Elade */}
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <Link
                href="/login"
                className={`rounded-lg py-2 text-center transition ${
                  !register
                    ? "bg-white text-indigo-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className={`rounded-lg py-2 text-center transition ${
                  register
                    ? "bg-white text-indigo-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đăng ký
              </Link>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {register ? "Tạo tài khoản Elade" : "Đăng nhập Elade"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                {register
                  ? "Tham gia mua bán và trao đổi thiết bị điện tử tại Elade C2C."
                  : "Chào mừng bạn quay trở lại sàn giao dịch thiết bị công nghệ Elade."}
              </p>
            </div>

            <form onSubmit={submit} className="mt-6" aria-busy={pending}>
              <fieldset disabled={pending} className="space-y-4">
                {register && (
                  <Input
                    id="fullName"
                    name="fullName"
                    label="Họ và tên"
                    placeholder="Nguyễn Văn An"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                )}

                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="ten@nhom5.vn"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Mật khẩu"
                  placeholder={register ? "Ít nhất 8 ký tự" : "Nhập mật khẩu"}
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={register ? 8 : 1}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  helperText={
                    register
                      ? "Ít nhất 8 ký tự, tối đa 72 byte UTF-8."
                      : undefined
                  }
                />

                {register && (
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Số điện thoại (tùy chọn)"
                    placeholder="0901234567"
                    autoComplete="tel"
                    maxLength={20}
                    helperText="8–15 chữ số; có thể dùng dấu +, khoảng trắng, (), -; tối đa 20 ký tự."
                  />
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  fullWidth
                  className="mt-2"
                >
                  {pending
                    ? "Đang xử lý…"
                    : register
                      ? "Đăng ký"
                      : "Đăng nhập"}
                </Button>
              </fieldset>
            </form>

            <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
              {register ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <Link
                href={register ? "/login" : "/register"}
                className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                {register ? "Đăng nhập" : "Đăng ký"}
              </Link>
            </p>
          </Card>

          {!register && (
            <Card className="rounded-2xl border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tài khoản demo
                </h2>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Mật khẩu: 123456
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Chọn nhanh một tài khoản mẫu để điền thông tin đăng nhập.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword("123456");
                      setError("");
                    }}
                    className="justify-between text-left"
                  >
                    <span className="truncate font-semibold text-slate-800">
                      {account.email}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium text-slate-500">
                      {account.roleLabel}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}
