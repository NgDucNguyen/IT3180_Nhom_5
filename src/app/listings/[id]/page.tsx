import Link from "next/link";
import { Container } from "@/components/layout";
import {
  EmptyState,
  ListingCard,
  PriceText,
  StatusBadge,
} from "@/components/ui";
import {
  ListingActionSlots,
  ListingImageGallery,
  formatSpecLabel,
  getListingDetailById,
} from "@/features/discovery";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang Chi tiết sản phẩm (/listings/[id]).
 * Hiển thị đầy đủ: Hình ảnh, Tình trạng, Nhãn trao đổi, Bảng thông số kỹ thuật (specsJson),
 * Thông tin người bán, và 3 Vùng nút bấm (Action Slots) cho TV5, TV7, TV8.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const { listing, relatedListings } = await getListingDetailById(id);

  if (!listing) {
    return (
      <main className="py-14">
        <Container>
          <EmptyState
            icon="⚠️"
            title="Không tìm thấy tin đăng hoặc thiết bị đã bị ẩn"
            description="Tin đăng bạn đang tìm không tồn tại, đang chờ kiểm duyệt hoặc đã được người bán gỡ khỏi danh sách công khai."
            actionLabel="Quay lại Khám phá sản phẩm"
            actionHref="/listings"
          />
        </Container>
      </main>
    );
  }

  const specEntries = Object.entries(listing.specs);
  const brandName = listing.brand?.name ?? "Phụ kiện / Không phân biệt hãng";
  const createdDateFormatted = new Date(listing.createdAt).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

  return (
    <main className="py-8">
      <Container>
        {/* 1. Breadcrumb điều hướng */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-indigo-600">
            Khám phá
          </Link>
          <span>/</span>
          <Link
            href={`/listings?category=${listing.category.slug}`}
            className="hover:text-indigo-600"
          >
            {listing.category.name}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 font-semibold text-slate-800">
            {listing.title}
          </span>
        </nav>

        {/* 2. Khối nội dung chính: Hình ảnh & Thông số (Trái) + Giá, Người bán & Action Slots (Phải) */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* CỘT TRÁI (7 cột): Ảnh thiết bị + Mô tả + Bảng thông số kỹ thuật (specsJson) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Bộ sưu tập hình ảnh tương tác */}
            <ListingImageGallery
              title={listing.title}
              images={listing.images}
              condition={listing.condition}
              status={listing.status}
              allowExchange={listing.allowExchange}
            />

            {/* BẢNG THÔNG SỐ KỸ THUẬT (specsJson) */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    ⚙️ Bảng thông số kỹ thuật
                  </h2>
                </div>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {brandName}
                </span>
              </div>

              {specEntries.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody className="divide-y divide-slate-200">
                      {specEntries.map(([key, value], index) => (
                        <tr
                          key={key}
                          className={
                            index % 2 === 0 ? "bg-slate-50/70" : "bg-white"
                          }
                        >
                          <th
                            scope="row"
                            className="w-2/5 px-4 py-3 font-semibold text-slate-700"
                          >
                            {formatSpecLabel(key)}
                          </th>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                  Người bán chưa bổ sung thông số kỹ thuật chi tiết cho thiết bị
                  này.
                </p>
              )}
            </section>

            {/* MÔ TẢ CHI TIẾT THIẾT BỊ */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900">
                📝 Mô tả tình trạng &amp; Phụ kiện đi kèm
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {listing.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>
                  Ngày đăng tin:{" "}
                  <strong className="text-slate-700">
                    {createdDateFormatted}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Danh mục:{" "}
                  <Link
                    href={`/listings?category=${listing.category.slug}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {listing.category.name}
                  </Link>
                </span>
                {listing.brand && (
                  <>
                    <span>•</span>
                    <span>
                      Thương hiệu:{" "}
                      <Link
                        href={`/listings?brand=${listing.brand.slug}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        {listing.brand.name}
                      </Link>
                    </span>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (5 cột): Tóm tắt giá, Ghi chú trao đổi, Thông tin người bán & 3 ACTION SLOTS */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              {/* Danh mục & Thương hiệu */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/listings?category=${listing.category.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <span aria-hidden>{listing.category.icon ?? "📦"}</span>
                  <span>{listing.category.name}</span>
                </Link>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Hãng: {brandName}
                </span>
              </div>

              {/* Tiêu đề thiết bị */}
              <h1 className="mt-3 text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
                {listing.title}
              </h1>

              {/* Khung Giá bán */}
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
                <span className="block text-xs font-medium text-slate-500">
                  Giá niêm yết
                </span>
                <PriceText amount={listing.price} size="xl" />
              </div>

              {/* Thông tin mong muốn trao đổi (nếu allowExchange = true) */}
              {listing.allowExchange && (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-900">
                    <span aria-hidden>🔄</span>
                    <span>Chủ máy nhận giao lưu / trao đổi thiết bị</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-violet-800">
                    {listing.exchangePreference ||
                      "Chấp nhận đổi sang thiết bị điện tử khác, bù trừ tiền thoả thuận."}
                  </p>
                </div>
              )}

              {/* THÔNG TIN NGƯỜI BÁN */}
              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  👤 Thông tin người bán
                </h3>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white">
                      {listing.seller.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {listing.seller.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SĐT liên hệ:{" "}
                        <strong className="font-mono text-slate-700">
                          {listing.seller.phone ?? "Đang cập nhật"}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="ACTIVE" entity="user" />
                </div>
              </div>

              {/* 3 VÙNG NÚT BẤM (ACTION SLOTS) CHO TV5, TV7, TV8 */}
              <div className="mt-6">
                <ListingActionSlots
                  listingId={listing.id}
                  listingTitle={listing.title}
                  price={listing.price}
                  allowExchange={listing.allowExchange}
                  exchangePreference={listing.exchangePreference}
                  isAvailableForDeal={listing.isAvailableForDeal}
                  sellerId={listing.seller.id}
                  sellerName={listing.seller.fullName}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Thiết bị tương tự cùng danh mục */}
        {relatedListings.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">
                Thiết bị cùng danh mục {listing.category.name}
              </h2>
              <Link
                href={`/listings?category=${listing.category.slug}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Xem thêm →
              </Link>
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
