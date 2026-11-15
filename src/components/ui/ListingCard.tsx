import Link from "next/link";
import { AddToCartButton } from "@/features/cart";
import { PriceText } from "./PriceText";
import { StatusBadge } from "./StatusBadge";

export interface ListingCardItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  allowExchange: boolean;
  exchangePreference?: string | null;
  status?: string;
  images?: string[];
  imagesJson?: string | null;
  category: {
    id?: string;
    name: string;
    slug?: string;
    icon?: string | null;
  };
  brand?: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  seller?: {
    id?: string;
    fullName: string;
  } | null;
  createdAt?: Date | string;
}

export interface ListingCardProps {
  listing: ListingCardItem;
  showStatus?: boolean;
  className?: string;
}

const DEFAULT_DEVICE_IMAGE = "/images/placeholder-device.svg";

/**
 * Tách mảng URL ảnh từ trường images hoặc chuỗi JSON imagesJson.
 */
export function resolveListingImages(
  images?: string[],
  imagesJson?: string | null,
): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images;
  }
  if (!imagesJson) {
    return [DEFAULT_DEVICE_IMAGE];
  }
  try {
    const parsed: unknown = JSON.parse(imagesJson);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === "string"
    ) {
      return parsed as string[];
    }
  } catch {
    // Bỏ qua lỗi JSON không hợp lệ và trả về ảnh mặc định
  }
  return [DEFAULT_DEVICE_IMAGE];
}

/**
 * ListingCard — Thẻ hiển thị thiết bị điện tử thống nhất toàn sàn.
 * Hiển thị: hình ảnh, tên thiết bị, giá tiền định dạng VNĐ, nhãn tình trạng Mới/Cũ,
 * nhãn nổi bật "Nhận trao đổi" nếu allowExchange = true, tên danh mục & thương hiệu.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function ListingCard({
  listing,
  showStatus = false,
  className = "",
}: ListingCardProps) {
  const imageList = resolveListingImages(listing.images, listing.imagesJson);
  const coverImage = imageList[0] ?? DEFAULT_DEVICE_IMAGE;
  const brandName = listing.brand?.name ?? "Phụ kiện / Đa hãng";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md ${className}`.trim()}
    >
      {/* Khu vực hình ảnh & Nhãn nổi bật */}
      <Link
        href={`/listings/${listing.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100"
      >
        <img
          src={coverImage}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Góc trên trái: Nhãn Tình trạng Mới/Cũ + Trạng thái tin (nếu bật) */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <StatusBadge
            status={listing.condition}
            entity="condition"
            showDot={false}
            className="bg-white/95 shadow-xs backdrop-blur-xs"
          />
          {showStatus && listing.status && (
            <StatusBadge
              status={listing.status}
              entity="listing"
              className="bg-white/95 shadow-xs backdrop-blur-xs"
            />
          )}
        </div>

        {/* Góc trên phải: Nhãn nổi bật "Nhận trao đổi" nếu allowExchange = true */}
        {listing.allowExchange && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <span aria-hidden>🔄</span>
              <span>Nhận trao đổi</span>
            </span>
          </div>
        )}

        {/* Góc dưới trái: Danh mục & Thương hiệu */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/75 px-2 py-0.5 text-[11px] font-medium text-slate-100 backdrop-blur-xs">
            <span aria-hidden>{listing.category.icon ?? "📦"}</span>
            <span>{listing.category.name}</span>
          </span>
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
            {brandName}
          </span>
        </div>
      </Link>

      {/* Nội dung thông tin thiết bị */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Tên thiết bị */}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600">
            <Link href={`/listings/${listing.id}`} className="focus:outline-none">
              {listing.title}
            </Link>
          </h3>

          {/* Gợi ý mong muốn trao đổi nếu có */}
          {listing.allowExchange && listing.exchangePreference && (
            <p className="mt-1.5 line-clamp-1 rounded-md bg-violet-50 px-2 py-1 text-[11px] text-violet-700">
              <strong className="font-semibold">Đổi:</strong>{" "}
              {listing.exchangePreference}
            </p>
          )}
        </div>

        {/* Giá bán & Người bán */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <PriceText amount={listing.price} size="md" />
            <Link
              href={`/listings/${listing.id}`}
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Xem chi tiết →
            </Link>
          </div>

          {listing.seller && (
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="truncate">
                Người bán:{" "}
                <strong className="font-medium text-slate-700">
                  {listing.seller.fullName}
                </strong>
              </span>
              <AddToCartButton
                listingId={listing.id}
                sellerId={listing.seller.id}
                variant="card"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
