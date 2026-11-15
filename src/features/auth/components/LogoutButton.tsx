"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { notifyAuthChanged } from "@/features/cart";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("logout");
      notifyAuthChanged();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Chưa thể đăng xuất. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }
  return <div>
    <Button disabled={pending} onClick={logout}>{pending ? "Đang đăng xuất…" : "Đăng xuất"}</Button>
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
  </div>;
}
