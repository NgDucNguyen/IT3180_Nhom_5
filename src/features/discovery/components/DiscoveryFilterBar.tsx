import Link from "next/link";
import { CONDITION_LABEL_VI, CONDITION_VALUES } from "@/lib/constants";
import type {
  CatalogBrandItem,
  CatalogCategoryItem,
  DiscoveryFilterParams,
} from "../types";

export interface DiscoveryFilterBarProps {
  categories: CatalogCategoryItem[];
  brands: CatalogBrandItem[];
  filters: DiscoveryFilterParams;
}

const PRICE_PRESETS = [
  { label: "Dưới 5 triệu", min: undefined, max: 5000000 },
  { label: "5 – 15 triệu", min: 5000000, max: 15000000 },
  { label: "15 – 25 triệu", min: 15000000, max: 25000000 },
  { label: "Trên 25 triệu", min: 25000000, max: undefined },
] as const;

/**
 * Bộ lọc đa tiêu chí (Sidebar Filter) cho trang Khám phá (/listings).
 * Sử dụng GET form thuần chuẩn App Router để đồng bộ 100% với URL searchParams.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export function DiscoveryFilterBar({
  categories,
  brands,
  filters,
}: DiscoveryFilterBarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <span aria-hidden>🎛️</span>
          <span>Bộ lọc tìm kiếm</span>
        </h2>
        <Link
          href="/listings"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Đặt lại
        </Link>
      </div>

      <form action="/listings" method="GET" className="mt-4 space-y-5">
        {/* 1. Từ khoá tìm kiếm */}
        <div>
          <label
            htmlFor="filter-q"
            className="block text-xs font-semibold text-slate-700"
          >
            Từ khoá thiết bị
          </label>
          <input
            id="filter-q"
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="VD: iPhone 15, RTX 4060, M3..."
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* 2. Danh mục sản phẩm (Category) */}
        <div>
          <label
            htmlFor="filter-category"
            className="block text-xs font-semibold text-slate-700"
          >
            Danh mục thiết bị
          </label>
          <select
            id="filter-category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name} ({cat.activeCount})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Thương hiệu (Brand) */}
        <div>
          <label
            htmlFor="filter-brand"
            className="block text-xs font-semibold text-slate-700"
          >
            Thương hiệu (Hãng)
          </label>
          <select
            id="filter-brand"
            name="brand"
            defaultValue={filters.brand ?? ""}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name} ({brand.activeCount})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Tình trạng thiết bị (Condition) */}
        <div>
          <label
            htmlFor="filter-condition"
            className="block text-xs font-semibold text-slate-700"
          >
            Tình trạng máy
          </label>
          <select
            id="filter-condition"
            name="condition"
            defaultValue={filters.condition ?? ""}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Mọi tình trạng</option>
            {CONDITION_VALUES.map((cond) => (
              <option key={cond} value={cond}>
                {CONDITION_LABEL_VI[cond]}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Khoảng giá (VNĐ) */}
        <div>
          <span className="block text-xs font-semibold text-slate-700">
            Khoảng giá (VNĐ)
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter-min-price" className="sr-only">
                Giá tối thiểu
              </label>
              <input
                id="filter-min-price"
                type="number"
                name="minPrice"
                min={0}
                step={100000}
                defaultValue={filters.minPrice ?? ""}
                placeholder="Từ (₫)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="filter-max-price" className="sr-only">
                Giá tối đa
              </label>
              <input
                id="filter-max-price"
                type="number"
                name="maxPrice"
                min={0}
                step={100000}
                defaultValue={filters.maxPrice ?? ""}
                placeholder="Đến (₫)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Gợi ý mức giá nhanh */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((preset) => {
              const params = new URLSearchParams();
              if (filters.q) params.set("q", filters.q);
              if (filters.category) params.set("category", filters.category);
              if (filters.brand) params.set("brand", filters.brand);
              if (filters.condition) params.set("condition", filters.condition);
              if (filters.allowExchange) params.set("allowExchange", "true");
              if (preset.min !== undefined) {
                params.set("minPrice", String(preset.min));
              }
              if (preset.max !== undefined) {
                params.set("maxPrice", String(preset.max));
              }

              const active =
                filters.minPrice === preset.min &&
                filters.maxPrice === preset.max;

              return (
                <Link
                  key={preset.label}
                  href={`/listings?${params.toString()}`}
                  className={`rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {preset.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 6. Lọc tin Nhận trao đổi (allowExchange) */}
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              name="allowExchange"
              value="true"
              defaultChecked={Boolean(filters.allowExchange)}
              className="mt-0.5 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-xs leading-snug text-slate-800">
              <strong className="font-semibold text-violet-900">
                🔄 Chỉ hiện máy nhận trao đổi
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-600">
                Cho phép đổi thiết bị của bạn kèm bù trừ tiền hợp lý
              </span>
            </span>
          </label>
        </div>

        {/* 7. Thứ tự sắp xếp */}
        <div>
          <label
            htmlFor="filter-sort"
            className="block text-xs font-semibold text-slate-700"
          >
            Sắp xếp theo
          </label>
          <select
            id="filter-sort"
            name="sort"
            defaultValue={filters.sort}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Mới đăng gần nhất</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
          </select>
        </div>

        {/* Nút Áp dụng bộ lọc */}
        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
        >
          Áp dụng bộ lọc
        </button>
      </form>
    </aside>
  );
}
