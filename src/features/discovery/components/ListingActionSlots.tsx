"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, formatPriceVnd } from "@/components/ui";

export interface ListingActionSlotsProps {
  listingId: string;
  listingTitle: string;
  price: number;
  allowExchange: boolean;
  exchangePreference: string | null;
  isAvailableForDeal: boolean;
  sellerName: string;
}

type ActiveSlotModal = "purchase" | "exchange" | "report" | null;

/**
 * ListingActionSlots — 3 Vùng nút bấm (Action Slots) trên trang Chi tiết sản phẩm (/listings/[id]).
 *
 * Thiết kế sẵn điểm gắn kết (Integration Slots) chuẩn xác để:
 *  - [SLOT TV5] Gắn chức năng "Gửi yêu cầu mua" (PurchaseRequest -> POST /api/purchase-requests)
 *  - [SLOT TV7] Gắn chức năng "Đề nghị trao đổi thiết bị" (ExchangeOffer -> POST /api/exchange-offers)
 *  - [SLOT TV8] Gắn chức năng "Báo cáo tin vi phạm" (Report -> POST /api/reports)
 *
 * Chủ sở hữu khung tích hợp: TV4 (UI/UX Lead).
 */
export function ListingActionSlots({
  listingId,
  listingTitle,
  price,
  allowExchange,
  exchangePreference,
  isAvailableForDeal,
  sellerName,
}: ListingActionSlotsProps) {
  const [activeSlot, setActiveSlot] = useState<ActiveSlotModal>(null);

  return (
    <div className="space-y-4">
      {/* Khung chính chứa 2 nút giao dịch cốt lõi: MUA (TV5) & TRAO ĐỔI (TV7) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Phương thức giao dịch khả dụng
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Mã tin: <code className="font-mono text-slate-700">{listingId}</code>
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* ================================================================
           * [ACTION SLOT 1 — TV5: MODULE PURCHASE]
           * Thành viên 5 gắn Modal / Form gửi PurchaseRequest tại vùng này.
           * Endpoint đích: POST /api/purchase-requests
           * ================================================================ */}
          <div
            data-slot="tv5-purchase-action"
            className="flex flex-col justify-between rounded-xl border border-indigo-200 bg-white p-3.5 shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-950">
                  🛒 Mua trực tiếp
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Slot TV5
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Đề xuất giá mua hoặc đồng ý mức giá niêm yết{" "}
                <strong>{formatPriceVnd(price)}</strong>.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={!isAvailableForDeal}
              onClick={() =>
                setActiveSlot((prev) =>
                  prev === "purchase" ? null : "purchase",
                )
              }
              className="mt-3"
            >
              <span>Gửi yêu cầu mua</span>
            </Button>
          </div>

          {/* ================================================================
           * [ACTION SLOT 2 — TV7: MODULE EXCHANGE]
           * Thành viên 7 gắn Modal / Form gửi ExchangeOffer tại vùng này.
           * Endpoint đích: POST /api/exchange-offers
           * ================================================================ */}
          <div
            data-slot="tv7-exchange-action"
            className={`flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs ${
              allowExchange
                ? "border-violet-200 bg-white"
                : "border-slate-200 bg-slate-100/70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-violet-950">
                  🔄 Đổi máy (Trade-in)
                </span>
                <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
                  Slot TV7
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                {allowExchange
                  ? exchangePreference ||
                    "Chủ tin chấp nhận đổi thiết bị điện tử khác kèm bù trừ tiền."
                  : "Người bán hiện chỉ nhận bán thẳng, không bật nhận trao đổi cho tin này."}
              </p>
            </div>

            <Button
              variant="exchange"
              size="md"
              fullWidth
              disabled={!isAvailableForDeal || !allowExchange}
              onClick={() =>
                setActiveSlot((prev) =>
                  prev === "exchange" ? null : "exchange",
                )
              }
              className="mt-3"
            >
              <span>Đề nghị trao đổi thiết bị</span>
            </Button>
          </div>
        </div>

        {!isAvailableForDeal && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            ⚠️ Thiết bị này hiện đang trong giao dịch hoặc đã bán/trao đổi xong,
            không thể gửi yêu cầu mới.
          </p>
        )}
      </div>

      {/* ====================================================================
       * [ACTION SLOT 3 — TV8: MODULE REPORT]
       * Thành viên 8 gắn Modal / Form gửi Báo cáo vi phạm (Report) tại vùng này.
       * Endpoint đích: POST /api/reports
       * ==================================================================== */}
      <div
        data-slot="tv8-report-action"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
      >
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span aria-hidden>🛡️</span>
          <span>
            Phát hiện thông tin sai lệch, hàng giả hoặc dấu hiệu lừa đảo?
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            setActiveSlot((prev) => (prev === "report" ? null : "report"))
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <span aria-hidden>🚩</span>
          <span>Báo cáo tin vi phạm</span>
          <span className="rounded bg-rose-200/70 px-1 py-0.2 text-[10px] text-rose-800">
            Slot TV8
          </span>
        </button>
      </div>

      {/* Khung hiển thị chi tiết Slot khi người dùng bấm thử trên giao diện */}
      {activeSlot === "purchase" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-indigo-950">
              🛒 [Action Slot TV5] Khung Gửi Yêu Cầu Mua Hàng (PurchaseRequest)
            </h4>
            <button
              type="button"
              onClick={() => setActiveSlot(null)}
              className="text-slate-500 hover:text-slate-800"
            >
              Đóng ✕
            </button>
          </div>
          <p className="mt-1.5">
            Thiết bị: <strong>{listingTitle}</strong> · Người bán:{" "}
            <strong>{sellerName}</strong>
          </p>
          <p className="mt-1 text-slate-600">
            Thành viên 5 sẽ gắn form nhập{" "}
            <code className="font-mono text-indigo-700">offeredPrice</code> (VND)
            và <code className="font-mono text-indigo-700">message</code> gửi
            tới <code className="font-mono">POST /api/purchase-requests</code>.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/buyer/requests"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
            >
              Mở trang Yêu cầu mua của TV5 →
            </Link>
          </div>
        </div>
      )}

      {activeSlot === "exchange" && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-violet-950">
              🔄 [Action Slot TV7] Khung Đề Nghị Trao Đổi Thiết Bị (ExchangeOffer)
            </h4>
            <button
              type="button"
              onClick={() => setActiveSlot(null)}
              className="text-slate-500 hover:text-slate-800"
            >
              Đóng ✕
            </button>
          </div>
          <p className="mt-1.5">
            Thiết bị mục tiêu (X): <strong>{listingTitle}</strong>
          </p>
          <p className="mt-1 text-slate-600">
            Thành viên 7 sẽ gắn bộ chọn thiết bị Y của người đề nghị (
            <code className="font-mono text-violet-700">offeredListingId</code>
            ), số tiền bù thêm (
            <code className="font-mono text-violet-700">cashTopUp</code>) và lời
            nhắn gửi tới{" "}
            <code className="font-mono">POST /api/exchange-offers</code>.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/exchanges"
              className="rounded-lg bg-violet-600 px-3 py-1.5 font-semibold text-white hover:bg-violet-500"
            >
              Mở trang Đề nghị trao đổi của TV7 →
            </Link>
          </div>
        </div>
      )}

      {activeSlot === "report" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-rose-950">
              🚩 [Action Slot TV8] Khung Báo Cáo Tin Vi Phạm (Report)
            </h4>
            <button
              type="button"
              onClick={() => setActiveSlot(null)}
              className="text-slate-500 hover:text-slate-800"
            >
              Đóng ✕
            </button>
          </div>
          <p className="mt-1.5">
            Báo cáo tin đăng: <strong>{listingTitle}</strong> (ID:{" "}
            <code className="font-mono">{listingId}</code>)
          </p>
          <p className="mt-1 text-slate-600">
            Thành viên 8 sẽ gắn form chọn lý do vi phạm (
            <code className="font-mono text-rose-700">reason</code>) và mô tả
            chi tiết (
            <code className="font-mono text-rose-700">description</code>) gửi
            tới <code className="font-mono">POST /api/reports</code>.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-500"
            >
              Mở trang Quản trị &amp; Báo cáo của TV8 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
