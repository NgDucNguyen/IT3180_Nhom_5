"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/layout";
import { Card, EmptyState, ListingCard } from "@/components/ui";
import type { ShopStorefrontDTO } from "@/features/shop/types";
import { getShopThemeStyle } from "./theme";

type ShopTab = "all" | "exchange" | "completed" | "about";
type SortMode = "newest" | "price_asc" | "price_desc";

export interface ShopStorefrontProps {
  storefront: ShopStorefrontDTO;
  isOwnShop: boolean;
}

/**
 * Giao diện Trang Shop cá nhân chuyên nghiệp cho Người bán trên Elade.
 * Gồm: Banner Shop + Chỉ số uy tín 2x3 + Thanh Tab danh mục/trạng thái + Tìm kiếm & lọc trong Shop.
 */
export function ShopStorefront({
  storefront,
  isOwnShop,
}: ShopStorefrontProps) {
  const { shop, owner, stats, activeListings, completedListings } = storefront;
  const theme = getShopThemeStyle(shop.bannerTheme);

  const [activeTab, setActiveTab] = useState<ShopTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [copied, setCopied] = useState(false);

  const shopInitial = shop.name.trim().charAt(0).toUpperCase() || "S";
  const joinedDate = new Date(shop.createdAt).toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  });

  const filteredActive = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = activeListings.filter((item) => {
      if (activeTab === "exchange" && !item.allowExchange) return false;
      if (selectedCategory !== "ALL" && item.category.id !== selectedCategory) {
        return false;
      }
      if (q) {
        const hay =
          `${item.title} ${item.brand?.name ?? ""} ${item.category.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortMode === "price_asc") {
      return [...base].sort((a, b) => a.price - b.price);
    }
    if (sortMode === "price_desc") {
      return [...base].sort((a, b) => b.price - a.price);
    }
    return base;
  }, [activeListings, activeTab, selectedCategory, searchQuery, sortMode]);

  async function copyShopLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="bg-slate-50 pb-14">
      {/* 1. KHỐI HEADER GIAN HÀNG */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="py-6">
          <div className="grid gap-5 lg:grid-cols-12">
            {/* BÊN TRÁI (5 cột): Banner nền tối + Avatar Shop + Tên + Uy tín */}
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradientClass} p-5 text-white shadow-sm lg:col-span-5`}
            >
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/15 text-2xl font-extrabold text-white shadow-inner backdrop-blur-xs">
                    {shop.avatarUrl ? (
                      <img
                        src={shop.avatarUrl}
                        alt={shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      shopInitial
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-xs ${
                      shop.isVerified
                        ? "bg-amber-400 text-slate-950"
                        : "bg-indigo-500 text-white"
                    }`}
                  >
                    {shop.isVerified ? "Uy tín" : "Shop"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-lg font-extrabold tracking-tight text-white sm:text-xl">
                      {shop.name}
                    </h1>
                    {shop.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                        ✓ Đã xác minh
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-200/90">
                    Chủ shop: <strong className="text-white">{owner.fullName}</strong>{" "}
                    · 📍 {shop.city}
                  </p>

                  {shop.tagline && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-200">
                      {shop.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Cụm nút hành động Shop */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/15 pt-3.5">
                {isOwnShop ? (
                  <>
                    <Link
                      href="/listings/create"
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                      + Đăng sản phẩm mới
                    </Link>
                    <Link
                      href="/seller/shop"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      ⚙️ Chỉnh sửa Shop
                    </Link>
                    <Link
                      href="/seller/listings"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      📦 Kênh Người Bán
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => void copyShopLink()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      <span>{copied ? "✓ Đã sao chép link Shop" : "🔗 Chia sẻ Shop"}</span>
                    </button>
                    {shop.contactPhone && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-mono text-xs font-semibold text-slate-100">
                        📞 {shop.contactPhone}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* BÊN PHẢI (7 cột): Bảng thông số hoạt động của Shop */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Sản phẩm đang bán</span>
                <strong className="mt-1 text-xl font-extrabold text-indigo-600">
                  {stats.activeCount}
                </strong>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Đã bán / Trao đổi</span>
                <strong className="mt-1 text-xl font-extrabold text-emerald-600">
                  {stats.completedDealsCount}
                </strong>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Nhận trao đổi (Swap)</span>
                <strong className="mt-1 text-xl font-extrabold text-violet-600">
                  {stats.exchangeAvailableCount} máy
                </strong>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Tỉ lệ hoàn tất đơn</span>
                <strong className="mt-1 text-base font-bold text-slate-900">
                  {stats.completionRate !== null
                    ? `${stats.completionRate}%`
                    : "Shop mới hoạt động"}
                </strong>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Khu vực giao dịch</span>
                <strong className="mt-1 text-base font-bold text-slate-900">
                  {shop.city}
                </strong>
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-xs text-slate-500">Tham gia Elade</span>
                <strong className="mt-1 text-base font-bold text-slate-900">
                  Từ {joinedDate}
                </strong>
              </div>
            </div>
          </div>

          {/* 2. THANH TAB ĐIỀU HƯỚNG SHOP */}
          <div className="mt-6 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
            {[
              {
                id: "all" as const,
                label: `Tất cả sản phẩm (${activeListings.length})`,
              },
              {
                id: "exchange" as const,
                label: `Nhận trao đổi (${stats.exchangeAvailableCount})`,
              },
              {
                id: "completed" as const,
                label: `Đã bán / Đổi xong (${completedListings.length})`,
              },
              { id: "about" as const, label: "Hồ sơ & Địa chỉ Shop" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. NỘI DUNG TỪNG TAB CỦA SHOP */}
      <Container className="mt-6">
        {(activeTab === "all" || activeTab === "exchange") && (
          <div className="space-y-5">
            {/* Thanh lọc danh mục trong shop + tìm kiếm + sắp xếp */}
            <Card className="rounded-2xl border-slate-200 p-4 shadow-2xs">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      selectedCategory === "ALL"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Tất cả danh mục
                  </button>
                  {stats.categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        selectedCategory === cat.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span aria-hidden>{cat.icon ?? "📦"}</span>
                      <span>
                        {cat.name} ({cat.count})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm trong Shop này..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-56"
                  />
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    aria-label="Sắp xếp sản phẩm trong Shop"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá thấp → cao</option>
                    <option value="price_desc">Giá cao → thấp</option>
                  </select>
                </div>
              </div>
            </Card>

            {filteredActive.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredActive.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🏪"
                title="Không có sản phẩm phù hợp trong mục này"
                description={
                  isOwnShop
                    ? "Shop của bạn chưa có sản phẩm đang bán ở bộ lọc này. Hãy đăng sản phẩm mới để tiếp cận người mua!"
                    : "Thử bỏ bộ lọc danh mục hoặc từ khóa để xem toàn bộ sản phẩm của Shop."
                }
                actionLabel={
                  isOwnShop ? "+ Đăng bán sản phẩm" : "Xem tất cả sản phẩm trên sàn"
                }
                actionHref={isOwnShop ? "/listings/create" : "/listings"}
              />
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Lịch sử thiết bị Shop đã giao dịch hoàn tất ({completedListings.length}{" "}
              sản phẩm) giúp người mua tham khảo độ uy tín của cửa hàng.
            </p>
            {completedListings.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {completedListings.map((item) => (
                  <ListingCard key={item.id} listing={item} showStatus />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📦"
                title="Shop chưa có sản phẩm đã hoàn tất"
                description="Các thiết bị đã bán hoặc trao đổi thành công sẽ hiển thị tại đây."
              />
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="rounded-2xl border-slate-200 p-6 shadow-2xs lg:col-span-7">
              <h2 className="text-base font-extrabold text-slate-900">
                Giới thiệu về {shop.name}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {shop.description ||
                  "Chủ cửa hàng chưa cập nhật mô tả chi tiết cho Shop."}
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200 p-6 shadow-2xs lg:col-span-5">
              <h2 className="text-base font-extrabold text-slate-900">
                Thông tin liên hệ &amp; Địa điểm
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <dt className="text-slate-500">Chủ sở hữu</dt>
                  <dd className="font-semibold text-slate-900">{owner.fullName}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <dt className="text-slate-500">Khu vực</dt>
                  <dd className="font-semibold text-slate-900">{shop.city}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <dt className="text-slate-500">Địa chỉ xem máy</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {shop.address || "Thỏa thuận địa điểm công khai"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">SĐT Shop</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {shop.contactPhone || "Trao đổi qua yêu cầu mua"}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        )}
      </Container>
    </main>
  );
}
