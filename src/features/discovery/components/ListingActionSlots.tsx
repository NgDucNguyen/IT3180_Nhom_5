"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Textarea,
  formatPriceVnd,
  type SelectOption,
} from "@/components/ui";
import { AddToCartButton } from "@/features/cart";

const REPORT_REASON_OPTIONS: SelectOption[] = [
  { value: "FRAUD", label: "Dấu hiệu lừa đảo / chiếm đoạt" },
  { value: "COUNTERFEIT", label: "Hàng giả / hàng nhái không rõ nguồn gốc" },
  { value: "WRONG_SPECS", label: "Thông số kỹ thuật sai lệch thực tế" },
  { value: "SPAM", label: "Tin rác / trùng lặp nhiều lần" },
  { value: "OTHER", label: "Lý do vi phạm khác" },
];

export interface ListingActionSlotsProps {
  listingId: string;
  listingTitle: string;
  price: number;
  allowExchange: boolean;
  exchangePreference: string | null;
  isAvailableForDeal: boolean;
  sellerId?: string;
  sellerName: string;
}

type ActiveSlotModal = "purchase" | "exchange" | "report" | null;

/**
 * ListingActionSlots — 3 Vùng nút bấm (Action Slots) trên trang Chi tiết sản phẩm (/listings/[id]).
 *
 * Thiết kế sẵn điểm gắn kết (Integration Slots) kèm Modal UI Kit chuẩn xác để:
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
  sellerId,
  sellerName,
}: ListingActionSlotsProps) {
  const [activeSlot, setActiveSlot] = useState<ActiveSlotModal>(null);
  const [offeredPriceInput, setOfferedPriceInput] = useState<string>(
    String(price),
  );
  const [cashTopUpInput, setCashTopUpInput] = useState<string>("0");
  const [reportReason, setReportReason] = useState<string>("FRAUD");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <AddToCartButton
          listingId={listingId}
          sellerId={sellerId}
          disabled={!isAvailableForDeal}
          variant="detail"
        />
      </div>

      {/* Khung chính chứa 2 nút giao dịch cốt lõi: MUA (TV5) & TRAO ĐỔI (TV7) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Phương thức giao dịch khả dụng
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
              onClick={() => setActiveSlot("purchase")}
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
              onClick={() => setActiveSlot("exchange")}
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
          onClick={() => setActiveSlot("report")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <span aria-hidden>🚩</span>
          <span>Báo cáo tin vi phạm</span>
          <span className="rounded bg-rose-200/70 px-1 py-0.2 text-[10px] text-rose-800">
            Slot TV8
          </span>
        </button>
      </div>

      {/* ====================================================================
       * MODAL 1 — TV5: Khung Gửi Yêu Cầu Mua (PurchaseRequest)
       * ==================================================================== */}
      <Modal
        open={activeSlot === "purchase"}
        onClose={() => setActiveSlot(null)}
        title="🛒 Gửi yêu cầu mua thiết bị (Slot TV5)"
        description={`Thiết bị: ${listingTitle} · Người bán: ${sellerName}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveSlot(null)}
            >
              Đóng
            </Button>
            <Link
              href="/buyer/requests"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              Đi tới phân hệ Yêu cầu mua (TV5) →
            </Link>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-900">
            <strong>Điểm tích hợp TV5:</strong> Gọi API{" "}
            <code className="font-mono font-bold">
              POST /api/purchase-requests
            </code>{" "}
            với <code className="font-mono">listingId=&quot;{listingId}&quot;</code>.
          </div>

          <Input
            label="Giá đề xuất mua (VND)"
            name="offeredPrice"
            type="number"
            min={1000}
            value={offeredPriceInput}
            onChange={(e) => setOfferedPriceInput(e.target.value)}
            rightAddon="₫"
            helperText={`Giá niêm yết hiện tại: ${formatPriceVnd(price)}`}
            required
          />

          <Textarea
            label="Lời nhắn gửi người bán"
            name="message"
            rows={3}
            placeholder="Ví dụ: Mình ở Bách Khoa Hà Nội, có thể qua xem và kiểm tra máy trực tiếp chiều nay..."
            helperText="Nhập thời gian, địa điểm hoặc yêu cầu kiểm tra thiết bị."
            required
          />
        </div>
      </Modal>

      {/* ====================================================================
       * MODAL 2 — TV7: Khung Đề Nghị Trao Đổi Thiết Bị (ExchangeOffer)
       * ==================================================================== */}
      <Modal
        open={activeSlot === "exchange"}
        onClose={() => setActiveSlot(null)}
        title="🔄 Đề nghị trao đổi thiết bị (Slot TV7)"
        description={`Đổi lấy máy mục tiêu (X): ${listingTitle}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveSlot(null)}
            >
              Đóng
            </Button>
            <Link
              href="/exchanges"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              Đi tới phân hệ Trao đổi (TV7) →
            </Link>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-xs text-violet-900">
            <strong>Điểm tích hợp TV7:</strong> Gọi API{" "}
            <code className="font-mono font-bold">
              POST /api/exchange-offers
            </code>{" "}
            với{" "}
            <code className="font-mono">
              targetListingId=&quot;{listingId}&quot;
            </code>
            .
          </div>

          <Select
            label="Chọn thiết bị của bạn đem ra đổi (Thiết bị Y)"
            name="offeredListingId"
            placeholder="-- Chọn 1 thiết bị đang ACTIVE của bạn --"
            options={[
              {
                value: "sample-offered-listing",
                label: "Thiết bị đang bán của bạn (TV7 sẽ nạp từ DB)",
              },
            ]}
            helperText="Chỉ các tin đăng ở trạng thái ACTIVE của bạn mới được đem ra trao đổi."
            required
          />

          <Input
            label="Số tiền bù trừ (cashTopUp — VND)"
            name="cashTopUp"
            type="number"
            value={cashTopUpInput}
            onChange={(e) => setCashTopUpInput(e.target.value)}
            rightAddon="₫"
            helperText="Số dương (+): bạn bù thêm tiền · Số âm (-): bạn muốn nhận bù · 0: đổi ngang."
          />

          <Textarea
            label="Ghi chú tình trạng & đề xuất giao lưu"
            name="message"
            rows={3}
            placeholder="Ví dụ: Máy mình fullbox còn bảo hành, bù thêm bạn 2.500.000đ..."
            required
          />
        </div>
      </Modal>

      {/* ====================================================================
       * MODAL 3 — TV8: Khung Báo Cáo Tin Vi Phạm (Report)
       * ==================================================================== */}
      <Modal
        open={activeSlot === "report"}
        onClose={() => setActiveSlot(null)}
        title="🚩 Báo cáo tin đăng vi phạm (Slot TV8)"
        description={`Báo cáo thiết bị: ${listingTitle} (Mã tin: ${listingId})`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setActiveSlot(null)}
            >
              Huỷ
            </Button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
            >
              Đi tới phân hệ Báo cáo &amp; Admin (TV8) →
            </Link>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-rose-900">
            <strong>Điểm tích hợp TV8:</strong> Gọi API{" "}
            <code className="font-mono font-bold">POST /api/reports</code> với{" "}
            <code className="font-mono">
              targetListingId=&quot;{listingId}&quot;
            </code>
            .
          </div>

          <Select
            label="Lý do báo cáo vi phạm"
            name="reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={REPORT_REASON_OPTIONS}
            required
          />

          <Textarea
            label="Mô tả bằng chứng chi tiết"
            name="description"
            rows={3}
            placeholder="Mô tả rõ dấu hiệu vi phạm (ảnh không đúng thực tế, thông số sai lệch, nghi ngờ lừa đảo...)"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
