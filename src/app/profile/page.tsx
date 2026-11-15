import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card, StatusBadge } from "@/components/ui";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { AuthError } from "@/features/auth/errors";
import { getCurrentUser } from "@/lib/auth";
import { ROLES, USER_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof AuthError) || error.status !== 403) throw error;
    return (
      <main className="py-12">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-extrabold text-slate-900">
                  Tài khoản đã bị khóa
                </h1>
                <StatusBadge
                  status={USER_STATUS.LOCKED}
                  entity="user"
                  size="md"
                />
              </div>
              <p className="mt-3 mb-5 text-sm leading-relaxed text-slate-600">
                Vui lòng liên hệ quản trị viên hoặc đăng xuất để sử dụng tài
                khoản khác.
              </p>
              <LogoutButton />
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  if (!user) redirect("/login");

  const isAdmin = user.role === ROLES.ADMIN;

  return (
    <main className="py-10 sm:py-12">
      <Container>
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-extrabold text-white shadow-xs">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {user.fullName}
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={user.status} entity="user" size="md" />
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                  {isAdmin ? "Quản trị viên" : "Thành viên"}
                </span>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Họ tên
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">
                  {user.fullName}
                </dd>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {user.email}
                </dd>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Số điện thoại
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                  {user.phone || "Chưa cập nhật"}
                </dd>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Vai trò
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {isAdmin ? "Quản trị viên" : "Người dùng"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/listings"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                >
                  Khám phá thiết bị
                </Link>
                <Link
                  href="/seller/listings"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Tin của tôi
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    Trang Admin
                  </Link>
                )}
              </div>

              <LogoutButton />
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
