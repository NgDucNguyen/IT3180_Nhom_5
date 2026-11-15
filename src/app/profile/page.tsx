import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { AuthError } from "@/features/auth/errors";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ROLES } from "@/lib/constants";

export default async function ProfilePage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof AuthError) || error.status !== 403) throw error;
    return <main className="mx-auto max-w-lg px-4 py-10"><Card>
      <h1 className="text-xl font-bold">Tài khoản đã bị khóa</h1>
      <p className="my-4 text-slate-600">Vui lòng liên hệ quản trị viên hoặc đăng xuất để dùng tài khoản khác.</p>
      <LogoutButton />
    </Card></main>;
  }
  if (!user) redirect("/login");
  return <main className="mx-auto max-w-lg px-4 py-10"><Card>
    <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
    <dl className="my-6 space-y-3 text-sm">
      <div><dt className="text-slate-500">Họ tên</dt><dd className="font-medium">{user.fullName}</dd></div>
      <div><dt className="text-slate-500">Email</dt><dd>{user.email}</dd></div>
      <div><dt className="text-slate-500">Số điện thoại</dt><dd>{user.phone || "Chưa cập nhật"}</dd></div>
      <div><dt className="text-slate-500">Vai trò</dt><dd>{user.role === ROLES.ADMIN ? "Quản trị viên" : "Người dùng"}</dd></div>
    </dl>
    <div className="flex items-center gap-4"><LogoutButton /><Link href="/listings" className="text-sm text-indigo-600 hover:underline">Khám phá thiết bị</Link></div>
  </Card></main>;
}
