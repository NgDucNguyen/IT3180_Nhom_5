"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Card } from "@/components/ui";
import { isValidPhoneNumber } from "@/features/auth/phone";

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
        setError("Số điện thoại cần có 8–15 chữ số và chỉ dùng dấu +, khoảng trắng, (), - để phân cách.");
        return;
      }
      if (new TextEncoder().encode(password).length > 72) {
        setError("Mật khẩu không được vượt quá 72 byte UTF-8.");
        return;
      }
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password,
          ...(register ? { fullName: form.get("fullName"), phone } : {}),
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = body && typeof body === "object" && "error" in body
          && body.error && typeof body.error === "object" && "message" in body.error
          && typeof body.error.message === "string" ? body.error.message : "Không thể xác thực. Vui lòng thử lại.";
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

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10 sm:py-16">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">{register ? "Tạo tài khoản" : "Đăng nhập"}</h1>
        <p className="mt-2 text-sm text-slate-600">{register ? "Tham gia mua bán và trao đổi thiết bị tại ElectroSwap C2C." : "Chào mừng bạn trở lại ElectroSwap C2C."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4" aria-busy={pending}>
          <fieldset disabled={pending} className="space-y-4">
            {register && <label className="block text-sm font-medium text-slate-700" htmlFor="fullName">Họ và tên
              <input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={100} className={inputClass} />
            </label>}
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Mật khẩu
              <input id="password" name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : 1} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={register ? "password-help" : undefined} className={inputClass} />
            </label>
            {register && <>
              <p id="password-help" className="text-xs text-slate-500">Ít nhất 8 ký tự, tối đa 72 byte UTF-8.</p>
              <label className="block text-sm font-medium text-slate-700" htmlFor="phone">Số điện thoại <span className="font-normal">(tùy chọn)</span>
                <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={20} aria-describedby="phone-help" className={inputClass} />
              </label>
              <p id="phone-help" className="text-xs text-slate-500">8–15 chữ số; có thể dùng dấu +, khoảng trắng, (), -; tối đa 20 ký tự.</p>
            </>}
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <Button type="submit" disabled={pending} fullWidth>{pending ? "Đang xử lý…" : register ? "Đăng ký" : "Đăng nhập"}</Button>
          </fieldset>
        </form>
        <p className="mt-5 text-sm text-slate-600">{register ? "Đã có tài khoản? " : "Chưa có tài khoản? "}<Link href={register ? "/login" : "/register"} className="font-semibold text-indigo-600 hover:underline">{register ? "Đăng nhập" : "Đăng ký"}</Link></p>
      </Card>
      {!register && <Card className="mt-5">
        <h2 className="font-semibold text-slate-900">Tài khoản demo</h2>
        <p className="mt-1 text-xs text-slate-500">Chọn tài khoản để điền nhanh. Mật khẩu demo: 123456.</p>
        <ul className="mt-3 space-y-2">
          {["admin", "an", "binh", "chi"].map((name) => <li key={name}>
            <Button variant="outline" size="sm" disabled={pending} onClick={() => { setEmail(`${name}@nhom5.vn`); setPassword("123456"); setError(""); }}>
              {name}@nhom5.vn · {name === "admin" ? "Quản trị viên" : "Người dùng"}
            </Button>
          </li>)}
        </ul>
      </Card>}
    </main>
  );
}
