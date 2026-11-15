"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PriceText,
  StatusBadge,
  resolveListingImages,
} from "@/components/ui";
import { useAppSession } from "./AppSessionProvider";
import type { CartItemDTO, CartSummaryDTO } from "@/features/cart/types";

export interface CartViewProps {
  initialCart: CartSummaryDTO;
}

function summarize(items: CartItemDTO[]): CartSummaryDTO {
  let availableCount = 0;
  let totalAmount = 0;
  for (const item of items) {
    if (item.available) {
      availableCount += 1;
      totalAmount += item.listing.price;
    }
  }
  return {
    items,
    totalCount: items.length,
    availableCount,
    totalAmount,
  };
}

/**
 * Giao diện trang Giỏ hàng (/cart).
 * Hiển thị danh sách thiết bị người dùng đã lưu kèm trạng thái còn hiệu lực,
 * tổng giá tạm tính và thao tác gỡ bỏ / đi tới chi tiết thiết bị để gửi yêu cầu mua/trao đổi.
 */
export function CartView({ initialCart }: CartViewProps) {
  const { refreshCart, removeFromCart } = useAppSession();
  const [cart, setCart] = useState<CartSummaryDTO>(initialCart);
  const [busyListingId, setBusyListingId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const unavailableCount = cart.totalCount - cart.availableCount;

  async function handleRemoveItem(listingId: string) {
    if (busyListingId) return;
    setBusyListingId(listingId);
    setError("");
    const result = await removeFromCart(listingId);
    setBusyListingId(null);

    if (!result.ok) {
      setError(result.message ?? "Không thể xóa thiết bị khỏi giỏ hàng.");
      return;
    }

    setCart((prev) => summarize(prev.items.filter((item) => item.listingId !== listingId)));
  }

  async function handleClearCart(onlyUnavailable: boolean) {
    if (clearing) return;
    setClearing(true);
    setError("");
    try {
      const response = await fetch(
        onlyUnavailable ? "/api/cart?onlyUnavailable=true" : "/api/cart",
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );
      if (!response.ok) {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        setError(body.error?.message ?? "Không thể dọn giỏ hàng.");
        return;
      }

      setCart((prev) =>
        onlyUnavailable
          ? summarize(prev.items.filter((item) => item.available))
          : summarize([]),
      );
      await refreshCart();
      setConfirmClearOpen(false);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setClearing(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Giỏ hàng của bạn đang trống"
        description="Hãy khám phá các thiết bị điện tử trên Elade và bấm 'Thêm vào giỏ' để lưu lại những sản phẩm bạn quan tâm."
        actionLabel="Khám phá thiết bị ngay"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Danh sách thiết bị trong giỏ (8 cột) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              Đang lưu{" "}
              <strong className="font-bold text-slate-900">
                {cart.totalCount}
              </strong>{" "}
              thiết bị
              {unavailableCount > 0 && (
                <span className="ml-1.5 text-amber-700">
                  ({unavailableCount} thiết bị không còn mở bán)
                </span>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {unavailableCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={clearing}
                  onClick={() => void handleClearCart(true)}
                >
                  Xóa tin hết hiệu lực
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                disabled={clearing}
                onClick={() => setConfirmClearOpen(true)}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {cart.items.map((item) => {
              const images = resolveListingImages(undefined, item.listing.imagesJson);
              const cover = images[0];
              const isRemoving = busyListingId === item.listingId;

              return (
                <Card
                  key={item.id}
                  className={`rounded-2xl p-4 shadow-xs transition ${
                    item.available
                      ? "border-slate-200 bg-white"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      href={`/listings/${item.listingId}`}
                      className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32"
                    >
                      <img
                        src={cover}
                        alt={item.listing.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge
                          status={item.listing.condition}
                          entity="condition"
                          showDot={false}
                        />
                        {!item.available && (
                          <StatusBadge
                            status={item.listing.status}
                            entity="listing"
                          />
                        )}
                        {item.listing.allowExchange && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                            🔄 Nhận trao đổi
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {item.listing.category.name}
                          {item.listing.brand ? ` · ${item.listing.brand.name}` : ""}
                        </span>
                      </div>

                      <h2 className="line-clamp-2 text-base font-bold text-slate-900">
                        <Link
                          href={`/listings/${item.listingId}`}
                          className="hover:text-indigo-600"
                        >
                          {item.listing.title}
                        </Link>
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Người bán:{" "}
                          <strong className="font-semibold text-slate-700">
                            {item.listing.seller.fullName}
                          </strong>
                        </span>
                        <PriceText amount={item.listing.price} size="md" />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                      {item.available ? (
                        <Link
                          href={`/listings/${item.listingId}`}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                        >
                          Xem &amp; Gửi yêu cầu →
                        </Link>
                      ) : (
                        <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                          Không còn mở bán
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRemoving}
                        onClick={() => void handleRemoveItem(item.listingId)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        {isRemoving ? "Đang xóa..." : "Xóa khỏi giỏ"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Khung tổng hợp tạm tính (4 cột) */}
        <div className="lg:col-span-4">
          <Card className="sticky top-28 rounded-3xl border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900">
              Tóm tắt giỏ hàng
            </h2>

            <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <dt>Tổng thiết bị đã lưu</dt>
                <dd className="font-semibold text-slate-900">
                  {cart.totalCount} máy
                </dd>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <dt>Đang sẵn sàng giao dịch</dt>
                <dd className="font-semibold text-emerald-700">
                  {cart.availableCount} máy
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Tổng giá trị tạm tính
              </span>
              <PriceText amount={cart.totalAmount} size="lg" />
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs leading-relaxed text-indigo-900">
              <strong>Lưu ý giao dịch C2C:</strong> Mỗi tin đăng là một thiết bị
              đơn chiếc từ từng người bán riêng biệt. Hãy mở từng máy để gửi yêu
              cầu mua hoặc đề nghị trao đổi với người bán.
            </div>

            <div className="mt-5 space-y-2.5">
              <Link
                href="/listings"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + Tiếp tục khám phá thiết bị
              </Link>
              <Link
                href="/buyer/requests"
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Theo dõi Yêu cầu mua →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => void handleClearCart(false)}
        title="Xóa toàn bộ giỏ hàng?"
        description="Toàn bộ thiết bị đã lưu trong giỏ hàng của bạn sẽ bị gỡ bỏ."
        confirmLabel="Xóa tất cả"
        confirmVariant="danger"
        isLoading={clearing}
      />
    </div>
  );
}
