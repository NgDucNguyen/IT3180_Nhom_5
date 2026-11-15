import Link from "next/link";
import { Container } from "@/components/layout";
import { EmptyState, ListingCard } from "@/components/ui";
import { getHomeFeaturedData } from "@/features/discovery";
import { CONDITION_LABEL_VI, CONDITION_VALUES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Trang chủ (/) — Sàn Mua Bán & Trao Đổi Thiết Bị Điện Tử ElectroSwap C2C.
 * Lấy dữ liệu thật từ Prisma SQLite Database.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default async function HomePage() {
  const { catalog, exchangeListings, latestListings } =
    await getHomeFeaturedData();

  return (
    <main className="pb-16">
      {/* 1. HERO BANNER + TÌM KIẾM & LỌC NHANH */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-12 text-white sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Mua bán &amp;{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Trao đổi thiết bị điện tử
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Tìm kiếm điện thoại, laptop, máy tính bảng và phụ kiện chính
                hãng. So sánh bảng thông số kỹ thuật chuẩn hoá, gửi yêu cầu mua
                hoặc đề nghị đổi máy (Trade-in) trực tiếp với người bán.
              </p>

              {/* Form tìm kiếm & lọc nhanh ngay trên Trang chủ */}
              <form
                action="/listings"
                method="GET"
                className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-3 shadow-xl backdrop-blur-xs"
              >
                <div className="grid gap-2.5 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <label htmlFor="home-search-q" className="sr-only">
                      Từ khoá tìm kiếm
                    </label>
                    <input
                      id="home-search-q"
                      type="search"
                      name="q"
                      placeholder="Nhập tên máy: iPhone 15, MacBook M3, S24 Ultra..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="home-search-category" className="sr-only">
                      Chọn danh mục
                    </label>
                    <select
                      id="home-search-category"
                      name="category"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Mọi danh mục</option>
                      {catalog.categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                      Khám phá ngay
                    </button>
                  </div>
                </div>

                {/* Các tag lọc nhanh dưới thanh tìm kiếm */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-2.5 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Lọc nhanh:</span>
                  <Link
                    href="/listings?allowExchange=true"
                    className="rounded-full bg-violet-500/20 px-2.5 py-0.5 font-semibold text-violet-300 ring-1 ring-violet-400/30 hover:bg-violet-500/30"
                  >
                    🔄 Nhận trao đổi ({catalog.totalExchangeListings})
                  </Link>
                  {CONDITION_VALUES.map((cond) => (
                    <Link
                      key={cond}
                      href={`/listings?condition=${cond}`}
                      className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      {CONDITION_LABEL_VI[cond]}
                    </Link>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. DANH MỤC NỔI BẬT (LẤY TỪ PRISMA DB) */}
      <section className="mt-10">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Danh mục thiết bị nổi bật
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Xem tất cả danh mục →
            </Link>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {catalog.categories.map((category) => (
              <Link
                key={category.id}
                href={`/listings?category=${category.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-600 group-hover:text-white">
                      {category.icon ?? "📦"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                      {category.activeCount} máy
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                    {category.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Thanh lọc nhanh theo Thương hiệu (Brand) */}
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-xs font-bold text-slate-700">
              Thương hiệu phổ biến:
            </span>
            {catalog.brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/listings?brand=${brand.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{brand.name}</span>
                <span className="text-[10px] text-slate-400">
                  ({brand.activeCount})
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. KHU VỰC NỔI BẬT: THIẾT BỊ NHẬN TRAO ĐỔI (ALLOW_EXCHANGE = TRUE) */}
      <section className="mt-12">
        <Container>
          <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/50 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Thiết bị sẵn sàng Trao Đổi
                </h2>
              </div>
              <Link
                href="/listings?allowExchange=true"
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-500"
              >
                Xem tất cả ({catalog.totalExchangeListings}) →
              </Link>
            </div>

            {exchangeListings.length > 0 ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {exchangeListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  icon="🔄"
                  title="Chưa có thiết bị mở trao đổi"
                  description="Hãy là người đầu tiên đăng tin thiết bị bật tính năng Nhận trao đổi."
                  actionLabel="Đăng tin ngay"
                  actionHref="/listings/create"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 4. DANH SÁCH TIN ĐĂNG MỚI NHẤT TRÊN SÀN */}
      <section className="mt-12">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Tin đăng thiết bị mới nhất
              </h2>
            </div>
            <Link
              href="/listings"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Mở bộ lọc nâng cao →
            </Link>
          </div>

          {latestListings.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latestListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon="📦"
                title="Chưa có tin đăng nào đang mở bán"
                description="Vui lòng chạy lệnh npx prisma db seed hoặc đăng tin bán thiết bị mới."
                actionLabel="Đăng tin bán thiết bị"
                actionHref="/listings/create"
              />
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
