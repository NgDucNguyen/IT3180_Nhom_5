import Link from "next/link";
import { Container } from "@/components/layout";
import { Card, EmptyState } from "@/components/ui";
import { getShopThemeStyle } from "@/features/shop";
import { listPublicShops } from "@/features/shop/service";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ShopsDirectoryPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ShopsDirectoryPage({
  searchParams,
}: ShopsDirectoryPageProps) {
  const { q = "" } = await searchParams;
  const [shops, currentUser] = await Promise.all([
    listPublicShops(q),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-7 flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Hệ thống Gian hàng C2C
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Cửa hàng &amp; Người bán trên Elade
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Khám phá các Shop thiết bị điện tử uy tín hoặc nâng cấp tài khoản
              mua hàng của bạn thành Shop riêng để vừa mua vừa bán.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {currentUser?.role === ROLES.SELLER && currentUser.shop ? (
              <Link
                href={`/shops/${currentUser.shop.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                🏪 Vào Shop của tôi
              </Link>
            ) : currentUser?.role !== ROLES.ADMIN ? (
              <Link
                href="/seller/upgrade"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                🚀 Mở Shop của bạn
              </Link>
            ) : null}
          </div>
        </div>

        {/* Thanh tìm Shop */}
        <form
          action="/shops"
          method="get"
          className="mb-6 flex flex-col gap-2.5 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên Shop, khẩu hiệu hoặc thành phố (VD: Hà Nội, Apple)..."
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Tìm Shop
          </button>
        </form>

        {shops.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="Chưa tìm thấy Shop phù hợp"
            description="Hãy thử từ khóa khác hoặc mở Shop đầu tiên của bạn trên Elade."
            actionLabel="Xem tất cả sản phẩm"
            actionHref="/listings"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
              const theme = getShopThemeStyle(shop.bannerTheme);
              return (
                <Card
                  key={shop.id}
                  className="overflow-hidden rounded-3xl border-slate-200 p-0 shadow-xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div
                    className={`bg-gradient-to-br ${theme.gradientClass} p-5 text-white`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 text-lg font-extrabold text-white">
                        {shop.avatarUrl ? (
                          <img
                            src={shop.avatarUrl}
                            alt={shop.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          shop.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="truncate text-base font-extrabold text-white">
                            {shop.name}
                          </h2>
                          {shop.isVerified && (
                            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                              ✓ Uy tín
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-200">
                          {shop.ownerName} · 📍 {shop.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="line-clamp-2 min-h-9 text-xs leading-relaxed text-slate-600">
                      {shop.tagline ||
                        "Cửa hàng thiết bị điện tử C2C trên sàn Elade."}
                    </p>

                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Đang bán
                        </span>
                        <strong className="text-sm font-extrabold text-indigo-600">
                          {shop.activeCount}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Đã giao dịch
                        </span>
                        <strong className="text-sm font-extrabold text-emerald-600">
                          {shop.completedCount}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500">
                          Nhận đổi
                        </span>
                        <strong className="text-sm font-extrabold text-violet-600">
                          {shop.exchangeCount}
                        </strong>
                      </div>
                    </div>

                    <Link
                      href={`/shops/${shop.slug}`}
                      className="flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/70 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      Ghé thăm Shop →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
