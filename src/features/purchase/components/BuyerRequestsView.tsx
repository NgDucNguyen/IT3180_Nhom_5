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
import { PURCHASE_REQUEST_STATUS } from "@/lib/constants";
import type { PurchaseRequestDTO } from "@/features/purchase/service";

export interface BuyerRequestsViewProps {
  initialRequests: PurchaseRequestDTO[];
}

export function BuyerRequestsView({ initialRequests }: BuyerRequestsViewProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    if (!cancelTargetId || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/purchase-requests/${cancelTargetId}/cancel`,
        {
          method: "PATCH",
          credentials: "same-origin",
        },
      );
      const body = (await response.json()) as {
        data?: PurchaseRequestDTO;
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể hủy yêu cầu mua.");
        return;
      }
      setRequests((prev) =>
        prev.map((item) => (item.id === cancelTargetId ? body.data! : item)),
      );
      setCancelTargetId(null);
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setPending(false);
    }
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon="🛍️"
        title="Bạn chưa gửi yêu cầu mua nào"
        description="Khi xem chi tiết sản phẩm của bất kỳ Shop nào, hãy bấm 'Gửi yêu cầu mua' để đặt giữ máy và theo dõi tại đây."
        actionLabel="Khám phá thiết bị ngay"
        actionHref="/listings"
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      {requests.map((req) => {
        const images = resolveListingImages(undefined, req.listing.imagesJson);
        const shopName = req.listing.seller.shop?.name ?? req.listing.seller.fullName;
        const canCancel = req.status === PURCHASE_REQUEST_STATUS.PENDING;

        return (
          <Card
            key={req.id}
            className="rounded-2xl border-slate-200 p-4 shadow-xs sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/listings/${req.listingId}`}
                className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32"
              >
                <img
                  src={images[0]}
                  alt={req.listing.title}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={req.status} entity="purchaseRequest" />
                  {req.listing.seller.shop ? (
                    <Link
                      href={`/shops/${req.listing.seller.shop.slug}`}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      🏪 {shopName}
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">Người bán: {shopName}</span>
                  )}
                </div>

                <h2 className="line-clamp-1 text-base font-bold text-slate-900">
                  <Link
                    href={`/listings/${req.listingId}`}
                    className="hover:text-indigo-600"
                  >
                    {req.listing.title}
                  </Link>
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    Giá đề xuất của bạn:{" "}
                    <PriceText amount={req.offeredPrice} size="sm" />
                  </span>
                  <span>
                    Giá niêm yết:{" "}
                    <strong className="text-slate-700">
                      <PriceText amount={req.listing.price} size="sm" />
                    </strong>
                  </span>
                </div>

                {req.message && (
                  <p className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                    Lời nhắn: &ldquo;{req.message}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                {req.transaction && (
                  <Link
                    href="/transactions"
                    className="inline-flex items-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                  >
                    Mở Giao dịch →
                  </Link>
                )}

                {canCancel && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelTargetId(req.id)}
                  >
                    Hủy yêu cầu
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      <ConfirmDialog
        open={Boolean(cancelTargetId)}
        onClose={() => setCancelTargetId(null)}
        onConfirm={() => void handleCancel()}
        title="Hủy yêu cầu mua này?"
        description="Yêu cầu sẽ chuyển sang trạng thái Đã hủy và không thể khôi phục."
        confirmLabel="Xác nhận hủy"
        confirmVariant="danger"
        isLoading={pending}
      />
    </div>
  );
}
