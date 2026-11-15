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
import { EXCHANGE_OFFER_STATUS, ROLES } from "@/lib/constants";
import type { ExchangeOfferDTO } from "@/features/exchange/service";

export interface ExchangesWorkspaceProps {
  currentUserId: string;
  currentUserRole: string;
  initialOffers: ExchangeOfferDTO[];
}

export function ExchangesWorkspace({
  currentUserId,
  currentUserRole,
  initialOffers,
}: ExchangesWorkspaceProps) {
  const pendingReceivedCount = initialOffers.filter(
    (offer) =>
      offer.receiverId === currentUserId &&
      offer.status === EXCHANGE_OFFER_STATUS.PENDING,
  ).length;

  const [tab, setTab] = useState<"all" | "received" | "sent">(
    pendingReceivedCount > 0 ? "received" : "all",
  );
  const [offers, setOffers] = useState<ExchangeOfferDTO[]>(initialOffers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    id: string;
    action: "reject" | "cancel";
  } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshOffers() {
    const response = await fetch("/api/exchange-offers", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (response.ok) {
      const body = (await response.json()) as { data?: ExchangeOfferDTO[] };
      if (body.data) setOffers(body.data);
    }
  }

  async function handleAccept(offerId: string) {
    if (busyId) return;
    setBusyId(offerId);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/exchange-offers/${offerId}/accept`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      const body = (await response.json()) as {
        data?: { id: string; status: string };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể chấp nhận đề nghị trao đổi.");
        return;
      }
      await refreshOffers();
      setNotice(
        "Đã chấp nhận trao đổi! Cả 2 thiết bị đã chuyển sang IN_TRANSACTION — hãy vào Đơn bán & Giao dịch để xác nhận hoàn tất 2 chiều.",
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmedAction() {
    if (!confirmState || busyId) return;
    setBusyId(confirmState.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/exchange-offers/${confirmState.id}/${confirmState.action}`,
        {
          method: "PATCH",
          credentials: "same-origin",
        },
      );
      const body = (await response.json()) as {
        data?: ExchangeOfferDTO;
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(
          body.error?.message ??
            (confirmState.action === "reject"
              ? "Không thể từ chối đề nghị."
              : "Không thể hủy đề nghị."),
        );
        return;
      }
      setOffers((prev) =>
        prev.map((item) => (item.id === confirmState.id ? body.data! : item)),
      );
      setNotice(
        confirmState.action === "reject"
          ? "Đã từ chối đề nghị trao đổi."
          : "Đã hủy đề nghị trao đổi.",
      );
      setConfirmState(null);
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  const receivedOffers = offers.filter((o) => o.receiverId === currentUserId);
  const sentOffers = offers.filter((o) => o.proposerId === currentUserId);
  const visibleOffers =
    tab === "received"
      ? receivedOffers
      : tab === "sent"
        ? sentOffers
        : offers;

  return (
    <div className="space-y-5">
      {currentUserRole === ROLES.USER && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
          <div>
            <strong>Mẹo trao đổi máy:</strong> Để đề nghị đổi 1 thiết bị của bạn
            lấy máy từ Shop khác, tài khoản cần mở Shop &amp; có ít nhất 1 tin đăng{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">ACTIVE</code>.
          </div>
          <Link
            href="/seller/upgrade"
            className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
          >
            🚀 Mở Shop ngay
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              tab === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Tất cả ({offers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("received")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              tab === "received"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Đã nhận ({receivedOffers.length})
            {pendingReceivedCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                {pendingReceivedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("sent")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              tab === "sent"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Đã gửi ({sentOffers.length})
          </button>
        </div>

        <Link
          href="/listings?allowExchange=true"
          className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          🔄 Tìm máy nhận trao đổi
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span>{notice}</span>
          <Link
            href="/transactions"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
          >
            Mở Đơn bán &amp; Giao dịch →
          </Link>
        </div>
      )}

      {visibleOffers.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="Chưa có đề nghị trao đổi nào"
          description="Khi xem một thiết bị có bật 'Nhận trao đổi', bạn có thể chọn máy ACTIVE của Shop mình kèm tiền bù để gửi đề nghị."
          actionLabel="Xem máy nhận trao đổi"
          actionHref="/listings?allowExchange=true"
        />
      ) : (
        <div className="space-y-4">
          {visibleOffers.map((offer) => {
            const isReceiver = offer.receiverId === currentUserId;
            const isPending = offer.status === EXCHANGE_OFFER_STATUS.PENDING;
            const targetImg = resolveListingImages(
              undefined,
              offer.targetListing.imagesJson,
            )[0];
            const offeredImg = resolveListingImages(
              undefined,
              offer.offeredListing.imagesJson,
            )[0];

            const proposerLabel =
              offer.proposer.shop?.name ?? offer.proposer.fullName;
            const receiverLabel =
              offer.receiver.shop?.name ?? offer.receiver.fullName;

            return (
              <Card
                key={offer.id}
                className="rounded-2xl border-slate-200 p-4 shadow-xs sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={offer.status} entity="exchangeOffer" />
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        isReceiver
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isReceiver
                        ? `Đề nghị gửi tới Shop của bạn từ ${proposerLabel}`
                        : `Bạn đề nghị đổi tới ${receiverLabel}`}
                    </span>
                  </div>

                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {offer.cashTopUp > 0 ? (
                      <>
                        Tiền bù kèm:{" "}
                        <PriceText amount={offer.cashTopUp} size="sm" />
                      </>
                    ) : (
                      "Đổi ngang · Bù 0đ"
                    )}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  {/* Máy đem đổi (của proposer) */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <Link
                      href={`/listings/${offer.offeredListing.id}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white"
                    >
                      <img
                        src={offeredImg}
                        alt={offer.offeredListing.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Máy đem đổi · {proposerLabel}
                      </p>
                      <Link
                        href={`/listings/${offer.offeredListing.id}`}
                        className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {offer.offeredListing.title}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <PriceText amount={offer.offeredListing.price} size="sm" />
                        <StatusBadge
                          status={offer.offeredListing.status}
                          entity="listing"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-lg font-bold text-indigo-600">
                    ⇄
                  </div>

                  {/* Máy mục tiêu (của receiver) */}
                  <div className="flex items-center gap-3 rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3">
                    <Link
                      href={`/listings/${offer.targetListing.id}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white"
                    >
                      <img
                        src={targetImg}
                        alt={offer.targetListing.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                        Máy mục tiêu ·{" "}
                        {offer.receiver.shop ? (
                          <Link
                            href={`/shops/${offer.receiver.shop.slug}`}
                            className="underline hover:text-indigo-800"
                          >
                            {receiverLabel}
                          </Link>
                        ) : (
                          receiverLabel
                        )}
                      </p>
                      <Link
                        href={`/listings/${offer.targetListing.id}`}
                        className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-indigo-600"
                      >
                        {offer.targetListing.title}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <PriceText amount={offer.targetListing.price} size="sm" />
                        <StatusBadge
                          status={offer.targetListing.status}
                          entity="listing"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {offer.message && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <span className="font-semibold text-slate-500">Lời nhắn:</span>{" "}
                    “{offer.message}”
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">
                    Tạo lúc{" "}
                    {new Date(offer.createdAt).toLocaleString("vi-VN")}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {isReceiver && isPending && (
                      <>
                        <Button
                          size="sm"
                          disabled={busyId === offer.id}
                          onClick={() => handleAccept(offer.id)}
                        >
                          {busyId === offer.id
                            ? "Đang xử lý..."
                            : "Chấp nhận trao đổi"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busyId === offer.id}
                          onClick={() =>
                            setConfirmState({ id: offer.id, action: "reject" })
                          }
                        >
                          Từ chối
                        </Button>
                      </>
                    )}

                    {!isReceiver && isPending && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === offer.id}
                        onClick={() =>
                          setConfirmState({ id: offer.id, action: "cancel" })
                        }
                      >
                        Hủy đề nghị
                      </Button>
                    )}

                    {offer.transaction && (
                      <Link
                        href="/transactions"
                        className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        Xem giao dịch trao đổi →
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        title={
          confirmState?.action === "reject"
            ? "Từ chối đề nghị trao đổi?"
            : "Hủy đề nghị trao đổi?"
        }
        description={
          confirmState?.action === "reject"
            ? "Đề nghị trao đổi này sẽ chuyển sang trạng thái REJECTED."
            : "Đề nghị trao đổi sẽ bị hủy và không thể khôi phục."
        }
        confirmLabel={
          confirmState?.action === "reject" ? "Xác nhận từ chối" : "Hủy đề nghị"
        }
        confirmVariant={confirmState?.action === "reject" ? "danger" : "primary"}
        isLoading={Boolean(confirmState && busyId === confirmState.id)}
        onConfirm={handleConfirmedAction}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
