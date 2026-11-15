import Link from "next/link";
import { Container } from "@/components/layout";
import {
  EmptyState,
  ListingCard,
  Pagination,
  formatPriceVnd,
} from "@/components/ui";
import {
  DiscoveryFilterBar,
  getDiscoveryCatalog,
  searchActiveListings,
  serializeDiscoverySearchParams,
} from "@/features/discovery";
import { CONDITION_LABEL_VI } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface ListingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Trang Danh sách sản phẩm, Tìm kiếm & Lọc đa tiêu chí (/listings).
 * Lấy dữ liệu thật từ Prisma Database và hỗ trợ lọc kết hợp:
 * Từ khoá (q), Danh mục (category), Thương hiệu (brand), Tình trạng (condition),
 * Khoảng giá (minPrice, maxPrice), Nhận trao đổi (allowExchange) và Sắp xếp (sort).
 *
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const resolvedParams = await searchParams;
  const [catalog, searchResult] = await Promise.all([
    getDiscoveryCatalog(),
    searchActiveListings(resolvedParams),
  ]);

  const { items, total, page, totalPages, appliedFilters } = searchResult;
  const serializedParams = serializeDiscoverySearchParams(appliedFilters);

  const selectedCategory = catalog.categories.find(
    (c) =>
      c.slug === appliedFilters.category || c.id === appliedFilters.category,
  );
  const selectedBrand = catalog.brands.find(
    (b) => b.slug === appliedFilters.brand || b.id === appliedFilters.brand,
  );

  const hasActiveFilters = Boolean(
    appliedFilters.q ||
      appliedFilters.category ||
      appliedFilters.brand ||
      appliedFilters.condition ||
      appliedFilters.minPrice !== undefined ||
      appliedFilters.maxPrice !== undefined ||
      appliedFilters.allowExchange,
  );

  return (
    <main className="py-8">
      <Container>
        {/* Header & Thanh chọn nhanh Danh mục */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                <Link href="/" className="hover:text-indigo-600">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="font-semibold text-slate-800">
                  Khám phá thiết bị
                </span>
              </nav>
              <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                {selectedCategory
                  ? `${selectedCategory.icon ?? "📦"} ${selectedCategory.name}`
                  : "Khám phá & Tìm kiếm thiết bị điện tử"}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-800">
                Tìm thấy <strong>{total}</strong> thiết bị phù hợp
              </span>
            </div>
          </div>

          {/* Thanh Pills Danh mục nổi bật */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
            <Link
              href="/listings"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                !appliedFilters.category
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Tất cả ({catalog.totalActiveListings})
            </Link>
            {catalog.categories.map((cat) => {
              const active =
                appliedFilters.category === cat.slug ||
                appliedFilters.category === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/listings?category=${cat.slug}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <span aria-hidden>{cat.icon ?? "📦"}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] ${
                      active ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    ({cat.activeCount})
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Layout 2 cột: Bộ lọc đa tiêu chí (Trái) + Lưới sản phẩm (Phải) */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Cột trái: Bộ lọc đa tiêu chí */}
          <div className="lg:col-span-3">
            <DiscoveryFilterBar
              categories={catalog.categories}
              brands={catalog.brands}
              filters={appliedFilters}
            />
          </div>

          {/* Cột phải: Kết quả tìm kiếm */}
          <div className="lg:col-span-9">
            {/* Thanh hiển thị các tiêu chí đang lọc */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2.5 text-xs">
                <span className="font-bold text-indigo-950">Đang lọc theo:</span>

                {appliedFilters.q && (
                  <span className=" rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200">
                    Từ khoá: &ldquo;{appliedFilters.q}&rdquo;
                  </span>
                )}

                {selectedCategory && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200">
                    Danh mục: {selectedCategory.name}
                  </span>
                )}

                {selectedBrand && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200">
                    Hãng: {selectedBrand.name}
                  </span>
                )}

                {appliedFilters.condition && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200">
                    Tình trạng: {CONDITION_LABEL_VI[appliedFilters.condition]}
                  </span>
                )}

                {(appliedFilters.minPrice !== undefined ||
                  appliedFilters.maxPrice !== undefined) && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-800 ring-1 ring-slate-200">
                    Giá:{" "}
                    {appliedFilters.minPrice !== undefined
                      ? formatPriceVnd(appliedFilters.minPrice)
                      : "0 ₫"}{" "}
                    –{" "}
                    {appliedFilters.maxPrice !== undefined
                      ? formatPriceVnd(appliedFilters.maxPrice)
                      : "Không giới hạn"}
                  </span>
                )}

                {appliedFilters.allowExchange && (
                  <span className="rounded-full bg-violet-600 px-2.5 py-1 font-semibold text-white">
                    🔄 Nhận trao đổi
                  </span>
                )}

                <Link
                  href="/listings"
                  className="ml-auto font-semibold text-rose-600 hover:underline"
                >
                  Xoá tất cả bộ lọc ✕
                </Link>
              </div>
            )}

            {/* Lưới sản phẩm hoặc EmptyState */}
            {items.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath="/listings"
                  searchParams={serializedParams}
                />
              </>
            ) : (
              <EmptyState
                icon="🔎"
                title="Không tìm thấy thiết bị phù hợp với bộ lọc"
                description="Hãy thử nới rộng khoảng giá, đổi từ khoá tìm kiếm hoặc đặt lại bộ lọc để xem toàn bộ sản phẩm đang mở bán."
                actionLabel="Xem toàn bộ thiết bị"
                actionHref="/listings"
              />
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
