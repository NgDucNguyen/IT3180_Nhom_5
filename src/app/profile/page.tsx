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
  const isSeller = user.role === ROLES.SELLER;
  const roleLabel = isAdmin
    ? "Quản trị viên (Admin)"
    : isSeller
      ? "Chủ Shop (kiêm Người mua)"
      : "Người mua (Buyer)";

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
                  {roleLabel}
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
                  {roleLabel}
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
                {!isAdmin && (
                  <>
                    <Link
                      href="/buyer/requests"
                      className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Yêu cầu mua đã gửi
                    </Link>
                    <Link
                      href="/transactions"
                      className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Đơn &amp; Giao dịch
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    🛡️ Trang Quản trị Admin
                  </Link>
                )}
              </div>

              <LogoutButton />
            </div>
          </Card>

          {/* Thẻ vai trò C2C theo từng Actor */}
          {user.role === ROLES.USER && (
            <Card className="rounded-3xl border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-[11px] font-bold text-indigo-700">
                    Nâng cấp Tài khoản
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Mở Shop của riêng bạn trên Elade
                  </h2>
                  <p className="text-sm text-slate-600">
                    Hiện bạn đang là <strong>Người mua</strong>. Khi nâng cấp
                    lên Chủ Shop, bạn có trang gian hàng riêng chuyên nghiệp để
                    đăng bán &amp; trao đổi thiết bị — đồng thời vẫn giữ nguyên
                    quyền mua hàng tại các Shop khác.
                  </p>
                </div>
                <Link
                  href="/seller/upgrade"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
                >
                  🚀 Đăng ký Mở Shop →
                </Link>
              </div>
            </Card>
          )}

          {isSeller && user.shop && (
            <Card className="rounded-3xl border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-300 bg-emerald-600 text-lg font-extrabold text-white shadow-xs">
                    {user.shop.avatarUrl ? (
                      <img
                        src={user.shop.avatarUrl}
                        alt={user.shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.shop.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
                        🏪 Gian hàng của bạn
                      </span>
                      {user.shop.isVerified && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          ✓ Shop Uy Tín
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {user.shop.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      /shops/{user.shop.slug} · {user.shop.city}
                      {user.shop.tagline ? ` · ${user.shop.tagline}` : ""}
                    </p>
                    <p className="pt-1 text-xs text-slate-600">
                      Tài khoản Chủ Shop của bạn vẫn có thể bỏ giỏ hàng, gửi yêu
                      cầu mua và giao dịch mua bình thường tại các Shop khác.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/shops/${user.shop.slug}`}
                    className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    Xem Trang Shop
                  </Link>
                  <Link
                    href="/seller/listings"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Kênh Người bán
                  </Link>
                  <Link
                    href="/seller/shop"
                    className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Tùy chỉnh Shop
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}
