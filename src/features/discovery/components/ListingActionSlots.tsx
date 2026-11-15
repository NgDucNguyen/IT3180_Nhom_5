"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Textarea,
  formatPriceVnd,
  type SelectOption,
} from "@/components/ui";
import { AddToCartButton, useAppSession } from "@/features/cart";
import { ROLES } from "@/lib/constants";

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

interface OwnExchangeOption {
  id: string;
  title: string;
  price: number;
}

/**
 * Cụm hành động giao dịch trên trang Chi tiết sản phẩm (/listings/[id]):
 *  - Thêm vào giỏ hàng
 *  - Gửi yêu cầu mua thật (POST /api/purchase-requests)
 *  - Đề nghị trao đổi thiết bị thật (POST /api/exchange-offers)
 *  - Báo cáo tin vi phạm thật (POST /api/reports)
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
  const router = useRouter();
  const { user } = useAppSession();

  const [activeSlot, setActiveSlot] = useState<ActiveSlotModal>(null);
  const [offeredPriceInput, setOfferedPriceInput] = useState<string>(
    String(price),
  );
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [ownListings, setOwnListings] = useState<OwnExchangeOption[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);
  const [offeredListingId, setOfferedListingId] = useState("");
  const [cashTopUpInput, setCashTopUpInput] = useState<string>("0");
  const [exchangeMessage, setExchangeMessage] = useState("");
  const [reportReason, setReportReason] = useState<string>("FRAUD");
  const [reportDescription, setReportDescription] = useState("");

  const [pending, setPending] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successNotice, setSuccessNotice] = useState<{
    message: string;
    href: string;
    linkLabel: string;
  } | null>(null);

  const isOwnListing = Boolean(user && sellerId && user.id === sellerId);
  const isSeller = user?.role === ROLES.SELLER;

  useEffect(() => {
    if (activeSlot !== "exchange" || !user) return;
    let cancelled = false;
    setLoadingOwn(true);
    fetch("/api/exchange-offers?includeOwn=true", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((body: { data?: { ownListings?: OwnExchangeOption[] } }) => {
        if (cancelled) return;
        const rows = body.data?.ownListings ?? [];
        setOwnListings(rows);
        if (rows[0]) setOfferedListingId(rows[0].id);
      })
      .catch(() => {
        if (!cancelled) setOwnListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOwn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlot, user]);

  function openModal(slot: ActiveSlotModal) {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalError("");
    setActiveSlot(slot);
  }

  async function submitPurchaseRequest() {
    if (pending) return;
    setPending(true);
    setModalError("");
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          offeredPrice: Number(offeredPriceInput || price),
          message: purchaseMessage,
        }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setModalError(
          body.error?.message ?? "Không thể gửi yêu cầu mua.",
        );
        return;
      }
      setActiveSlot(null);
      setPurchaseMessage("");
      setSuccessNotice({
        message: "Đã gửi yêu cầu mua tới Shop thành công!",
        href: "/buyer/requests",
        linkLabel: "Xem Yêu cầu mua của tôi →",
      });
    } catch {
      setModalError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  async function submitExchangeOffer() {
    if (pending) return;
    setPending(true);
    setModalError("");
    try {
      const response = await fetch("/api/exchange-offers", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetListingId: listingId,
          offeredListingId,
          cashTopUp: Number(cashTopUpInput || 0),
          message: exchangeMessage,
        }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        setModalError(
          body.error?.message ?? "Không thể gửi đề nghị trao đổi.",
        );
        return;
      }
      setActiveSlot(null);
      setExchangeMessage("");
      setSuccessNotice({
        message: "Đã gửi đề nghị trao đổi thiết bị thành công!",
        href: "/exchanges",
        linkLabel: "Theo dõi Đề nghị trao đổi →",
      });
    } catch {
      setModalError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  async function submitReport() {
    if (pending) return;
    setPending(true);
    setModalError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason: reportReason,
          description: reportDescription,
        }),
      });
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        setModalError(body.error?.message ?? "Không thể gửi báo cáo.");
        return;
      }
      setActiveSlot(null);
      setReportDescription("");
      setSuccessNotice({
        message: "Đã ghi nhận báo cáo vi phạm để Quản trị viên xem xét.",
        href: "/listings",
        linkLabel: "Quay lại Khám phá →",
      });
    } catch {
      setModalError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

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

      {successNotice && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
        >
          <span>✓ {successNotice.message}</span>
          <Link href={successNotice.href} className="underline hover:text-emerald-950">
            {successNotice.linkLabel}
          </Link>
        </div>
      )}

      {isOwnListing ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs text-indigo-900">
          <p className="font-bold">Đây là sản phẩm thuộc Shop của bạn.</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link
              href="/seller/listings"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
            >
              Quản lý tin đăng
            </Link>
            <Link
              href="/transactions"
              className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Xem đơn khách đặt
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Phương thức giao dịch khả dụng
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200 bg-white p-3.5 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-indigo-950">
                  🛒 Mua trực tiếp
                </span>
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
                onClick={() => openModal("purchase")}
                className="mt-3"
              >
                <span>Gửi yêu cầu mua</span>
              </Button>
            </div>

            <div
              className={`flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs ${
                allowExchange
                  ? "border-violet-200 bg-white"
                  : "border-slate-200 bg-slate-100/70"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-violet-950">
                  🔄 Đổi máy (Trade-in)
                </span>
                <p className="mt-1 text-[11px] text-slate-600">
                  {allowExchange
                    ? exchangePreference ||
                      "Chủ Shop chấp nhận đổi thiết bị khác kèm bù trừ tiền."
                    : "Shop hiện chỉ bán thẳng, không bật nhận trao đổi cho tin này."}
                </p>
              </div>

              <Button
                variant="exchange"
                size="md"
                fullWidth
                disabled={!isAvailableForDeal || !allowExchange}
                onClick={() => openModal("exchange")}
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
      )}

      {!isOwnListing && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span aria-hidden>🛡️</span>
            <span>
              Phát hiện thông tin sai lệch, hàng giả hoặc dấu hiệu lừa đảo?
            </span>
          </div>

          <button
            type="button"
            onClick={() => openModal("report")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <span aria-hidden>🚩</span>
            <span>Báo cáo tin vi phạm</span>
          </button>
        </div>
      )}

      {/* MODAL 1: Gửi Yêu Cầu Mua */}
      <Modal
        open={activeSlot === "purchase"}
        onClose={() => setActiveSlot(null)}
        title="🛒 Gửi yêu cầu mua thiết bị"
        description={`Thiết bị: ${listingTitle} · Shop: ${sellerName}`}
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
            <Button
              variant="primary"
              size="md"
              disabled={pending}
              onClick={() => void submitPurchaseRequest()}
            >
              {pending ? "Đang gửi..." : "Xác nhận gửi yêu cầu mua"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
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
            label="Lời nhắn gửi Shop"
            name="message"
            rows={3}
            value={purchaseMessage}
            onChange={(e) => setPurchaseMessage(e.target.value)}
            placeholder="Ví dụ: Mình ở Bách Khoa Hà Nội, có thể qua xem và kiểm máy trực tiếp chiều nay..."
            helperText="Nhập thời gian, địa điểm hoặc yêu cầu kiểm tra thiết bị."
          />

          {modalError && (
            <p role="alert" className="text-xs font-semibold text-rose-600">
              {modalError}
            </p>
          )}
        </div>
      </Modal>

      {/* MODAL 2: Đề Nghị Trao Đổi */}
      <Modal
        open={activeSlot === "exchange"}
        onClose={() => setActiveSlot(null)}
        title="🔄 Đề nghị trao đổi thiết bị"
        description={`Đổi lấy máy mục tiêu: ${listingTitle}`}
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
            {ownListings.length > 0 && (
              <Button
                variant="exchange"
                size="md"
                disabled={pending || !offeredListingId}
                onClick={() => void submitExchangeOffer()}
              >
                {pending ? "Đang gửi..." : "Gửi đề nghị trao đổi"}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {loadingOwn ? (
            <p className="text-xs text-slate-500">
              Đang tải danh sách thiết bị đang bán của bạn...
            </p>
          ) : ownListings.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="font-bold">
                {isSeller
                  ? "Bạn chưa có sản phẩm nào đang ACTIVE để đem đi trao đổi."
                  : "Chỉ tài khoản đã mở Shop và có sản phẩm đang mở bán mới có thể gửi đề nghị trao đổi máy."}
              </p>
              <div className="flex flex-wrap gap-2">
                {!isSeller ? (
                  <Link
                    href="/seller/upgrade"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white"
                  >
                    🚀 Mở Shop để đăng máy trao đổi
                  </Link>
                ) : (
                  <Link
                    href="/listings/create"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white"
                  >
                    + Đăng thêm thiết bị ngay
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <Select
                label="Chọn thiết bị của bạn đem ra đổi"
                name="offeredListingId"
                value={offeredListingId}
                onChange={(e) => setOfferedListingId(e.target.value)}
                options={ownListings.map((item) => ({
                  value: item.id,
                  label: `${item.title} (${formatPriceVnd(item.price)})`,
                }))}
                required
              />

              <Input
                label="Số tiền bù thêm cho Shop (VND)"
                name="cashTopUp"
                type="number"
                min={0}
                value={cashTopUpInput}
                onChange={(e) => setCashTopUpInput(e.target.value)}
                rightAddon="₫"
                helperText="Nhập 0 nếu trao đổi ngang giá trị."
              />

              <Textarea
                label="Ghi chú tình trạng máy & đề xuất giao lưu"
                name="message"
                rows={3}
                value={exchangeMessage}
                onChange={(e) => setExchangeMessage(e.target.value)}
                placeholder="Ví dụ: Máy mình fullbox còn bảo hành, bù thêm bạn 2.500.000đ..."
              />
            </>
          )}

          {modalError && (
            <p role="alert" className="text-xs font-semibold text-rose-600">
              {modalError}
            </p>
          )}
        </div>
      </Modal>

      {/* MODAL 3: Báo Cáo Vi Phạm */}
      <Modal
        open={activeSlot === "report"}
        onClose={() => setActiveSlot(null)}
        title="🚩 Báo cáo tin đăng vi phạm"
        description={`Báo cáo thiết bị: ${listingTitle}`}
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
            <Button
              variant="danger"
              size="md"
              disabled={pending}
              onClick={() => void submitReport()}
            >
              {pending ? "Đang gửi..." : "Gửi báo cáo vi phạm"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Lý do báo cáo vi phạm"
            name="reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={REPORT_REASON_OPTIONS}
            required
          />

          <Textarea
            label="Mô tả chi tiết vi phạm"
            name="description"
            rows={3}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Mô tả rõ điểm bất thường (giá ảo, ảnh mạng, yêu cầu cọc trước...) để Admin xử lý."
          />

          {modalError && (
            <p role="alert" className="text-xs font-semibold text-rose-600">
              {modalError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
