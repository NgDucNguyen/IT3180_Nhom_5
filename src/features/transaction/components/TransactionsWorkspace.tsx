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
import {
  PURCHASE_REQUEST_STATUS,
  ROLES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@/lib/constants";
import type { PurchaseRequestDTO } from "@/features/purchase/service";
import type { TransactionDTO } from "@/features/transaction/service";

export interface TransactionsWorkspaceProps {
  currentUserId: string;
  currentUserRole: string;
  initialIncomingRequests: PurchaseRequestDTO[];
  initialTransactions: TransactionDTO[];
}

export function TransactionsWorkspace({
  currentUserId,
  currentUserRole,
  initialIncomingRequests,
  initialTransactions,
}: TransactionsWorkspaceProps) {
  const isSeller = currentUserRole === ROLES.SELLER;
  const pendingIncoming = initialIncomingRequests.filter(
    (r) => r.status === PURCHASE_REQUEST_STATUS.PENDING,
  );

  const [tab, setTab] = useState<"incoming" | "transactions">(
    isSeller && pendingIncoming.length > 0 ? "incoming" : "transactions",
  );
  const [txFilter, setTxFilter] = useState<"all" | "buyer" | "seller">("all");
  const [incoming, setIncoming] = useState(initialIncomingRequests);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTxId, setCancelTxId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function refreshTransactions() {
    const res = await fetch("/api/transactions", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.ok) {
      const body = (await res.json()) as { data?: TransactionDTO[] };
      if (body.data) setTransactions(body.data);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    if (busyId) return;
    setBusyId(requestId);
    setError("");
    try {
      const res = await fetch(`/api/purchase-requests/${requestId}/accept`, {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await res.json()) as {
        data?: TransactionDTO;
        error?: { message?: string };
      };
      if (!res.ok) {
        setError(body.error?.message ?? "Không thể chấp nhận yêu cầu mua.");
        return;
      }
      const reqRes = await fetch("/api/purchase-requests?box=received", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (reqRes.ok) {
        const reqBody = (await reqRes.json()) as { data?: PurchaseRequestDTO[] };
        if (reqBody.data) setIncoming(reqBody.data);
      }
      await refreshTransactions();
      setTab("transactions");
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    if (busyId) return;
    setBusyId(requestId);
    setError("");
    try {
      const res = await fetch(`/api/purchase-requests/${requestId}/reject`, {
        method: "POST",
        credentials: "same-origin",
      });
      const body = (await res.json()) as { error?: { message?: string } };
      if (!res.ok) {
        setError(body.error?.message ?? "Không thể từ chối yêu cầu mua.");
        return;
      }
      setIncoming((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? { ...item, status: PURCHASE_REQUEST_STATUS.REJECTED }
            : item,
        ),
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmTransaction(txId: string) {
    if (busyId) return;
    setBusyId(txId);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${txId}/confirm`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      const body = (await res.json()) as {
        data?: TransactionDTO;
        error?: { message?: string };
      };
      if (!res.ok || !body.data) {
        setError(body.error?.message ?? "Không thể xác nhận giao dịch.");
        return;
      }
      setTransactions((prev) =>
        prev.map((item) => (item.id === txId ? body.data! : item)),
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancelTransaction() {
    if (!cancelTxId || busyId) return;
    setBusyId(cancelTxId);
    setError("");
    try {
      const res = await fetch(`/api/transactions/${cancelTxId}/cancel`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      const body = (await res.json()) as {
        data?: TransactionDTO;
        error?: { message?: string };
      };
      if (!res.ok || !body.data) {
        setError(body.error?.message ?? "Không thể hủy giao dịch.");
        return;
      }
      setTransactions((prev) =>
        prev.map((item) => (item.id === cancelTxId ? body.data! : item)),
      );
      setCancelTxId(null);
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredTx = transactions.filter((tx) => {
    if (txFilter === "buyer") return tx.buyerId === currentUserId;
    if (txFilter === "seller") return tx.sellerId === currentUserId;
    return true;
  });

  const activePendingIncoming = incoming.filter(
    (item) => item.status === PURCHASE_REQUEST_STATUS.PENDING,
  );

  return (
    <div className="space-y-5">
      {/* Thanh Tabs chuyển vai trò Đơn bán của Shop & Giao dịch */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTab("transactions")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "transactions"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            🤝 Giao dịch mua / đổi của tôi ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("incoming")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "incoming"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            📥 Yêu cầu khách đặt Shop ({activePendingIncoming.length} chờ duyệt)
          </button>
        </div>

        {!isSeller && (
          <Link
            href="/seller/upgrade"
            className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
          >
            🚀 Mở Shop để bán hàng
          </Link>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      {tab === "incoming" && (
        <div className="space-y-4">
          {!isSeller ? (
            <EmptyState
              icon="🏪"
              title="Bạn đang dùng tài khoản Người mua"
              description="Hãy nâng cấp thành Shop (Miễn phí) để đăng sản phẩm và nhận yêu cầu đặt mua từ khách hàng."
              actionLabel="Nâng cấp mở Shop ngay"
              actionHref="/seller/upgrade"
            />
          ) : incoming.length === 0 ? (
            <EmptyState
              icon="📥"
              title="Shop chưa nhận yêu cầu mua nào"
              description="Khi khách bấm 'Gửi yêu cầu mua' ở sản phẩm của bạn, đơn đặt hàng sẽ xuất hiện tại đây để bạn duyệt và khóa giao dịch."
              actionLabel="Xem sản phẩm của Shop"
              actionHref="/seller/listings"
            />
          ) : (
            incoming.map((req) => {
              const images = resolveListingImages(undefined, req.listing.imagesJson);
              const isPending = req.status === PURCHASE_REQUEST_STATUS.PENDING;
              const isBusy = busyId === req.id;

              return (
                <Card key={req.id} className="rounded-2xl border-slate-200 p-4 shadow-xs">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      href={`/listings/${req.listingId}`}
                      className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-28"
                    >
                      <img
                        src={images[0]}
                        alt={req.listing.title}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={req.status} entity="purchaseRequest" />
                        <span className="text-xs text-slate-500">
                          Khách hàng:{" "}
                          <strong className="text-slate-800">
                            {req.buyer.fullName}
                          </strong>
                          {req.buyer.phone ? ` · ${req.buyer.phone}` : ""}
                        </span>
                      </div>
                      <h3 className="line-clamp-1 text-sm font-bold text-slate-900">
                        {req.listing.title}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Giá khách đề xuất:{" "}
                        <PriceText amount={req.offeredPrice} size="sm" /> (Niêm yết:{" "}
                        <PriceText amount={req.listing.price} size="sm" />)
                      </p>
                      {req.message && (
                        <p className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          Lời nhắn: &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void handleAcceptRequest(req.id)}
                        >
                          {isBusy ? "Đang xử lý..." : "✓ Chấp nhận & Khóa máy"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void handleRejectRequest(req.id)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "transactions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all" as const, label: "Tất cả giao dịch" },
              { id: "buyer" as const, label: "🛒 Đơn tôi đi mua" },
              { id: "seller" as const, label: "🏪 Đơn Shop bán" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTxFilter(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  txFilter === item.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredTx.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="Chưa có giao dịch nào"
              description="Giao dịch phát sinh khi Shop chấp nhận Yêu cầu mua hoặc Đề nghị trao đổi. Cả hai bên sẽ xác nhận hoàn tất tại đây."
              actionLabel="Khám phá sản phẩm"
              actionHref="/listings"
            />
          ) : (
            filteredTx.map((tx) => {
              const amIBuyer = tx.buyerId === currentUserId;
              const myConfirmed = amIBuyer ? tx.buyerConfirmed : tx.sellerConfirmed;
              const otherConfirmed = amIBuyer
                ? tx.sellerConfirmed
                : tx.buyerConfirmed;
              const inProgress = tx.status === TRANSACTION_STATUS.IN_PROGRESS;
              const isBusy = busyId === tx.id;
              const shopTitle = tx.seller.shop?.name ?? tx.seller.fullName;

              return (
                <Card key={tx.id} className="rounded-2xl border-slate-200 p-5 shadow-xs">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={tx.status} entity="transaction" />
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            amIBuyer
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {amIBuyer ? "Vai trò: Người mua" : "Vai trò: Người bán (Shop)"}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {tx.type === TRANSACTION_TYPE.EXCHANGE
                            ? "🔄 Trao đổi thiết bị"
                            : "🛒 Mua bán trực tiếp"}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900">
                        <Link
                          href={`/listings/${tx.listingId}`}
                          className="hover:text-indigo-600"
                        >
                          {tx.listing.title}
                        </Link>
                      </h3>

                      {tx.secondaryListing && (
                        <p className="text-xs font-medium text-violet-700">
                          🔄 Đổi kèm thiết bị:{" "}
                          <Link
                            href={`/listings/${tx.secondaryListing.id}`}
                            className="underline"
                          >
                            {tx.secondaryListing.title}
                          </Link>
                          {tx.exchangeOffer && tx.exchangeOffer.cashTopUp > 0 && (
                            <>
                              {" · Bù thêm "}
                              <PriceText
                                amount={tx.exchangeOffer.cashTopUp}
                                size="sm"
                              />
                            </>
                          )}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Shop: <strong className="text-slate-800">{shopTitle}</strong>
                          {tx.seller.phone ? ` (${tx.seller.phone})` : ""}
                        </span>
                        <span>
                          Người mua:{" "}
                          <strong className="text-slate-800">
                            {tx.buyer.fullName}
                          </strong>
                          {tx.buyer.phone ? ` (${tx.buyer.phone})` : ""}
                        </span>
                        {tx.purchaseRequest && (
                          <span>
                            Giá thỏa thuận:{" "}
                            <PriceText
                              amount={tx.purchaseRequest.offeredPrice}
                              size="sm"
                            />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        <span
                          className={
                            tx.buyerConfirmed
                              ? "font-semibold text-emerald-700"
                              : "text-slate-500"
                          }
                        >
                          {tx.buyerConfirmed
                            ? "✓ Người mua đã xác nhận"
                            : "○ Chờ Người mua xác nhận"}
                        </span>
                        <span
                          className={
                            tx.sellerConfirmed
                              ? "font-semibold text-emerald-700"
                              : "text-slate-500"
                          }
                        >
                          {tx.sellerConfirmed
                            ? "✓ Người bán đã xác nhận"
                            : "○ Chờ Người bán xác nhận"}
                        </span>
                      </div>
                    </div>

                    {inProgress && (
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {!myConfirmed ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => void handleConfirmTransaction(tx.id)}
                          >
                            {isBusy
                              ? "Đang xác nhận..."
                              : otherConfirmed
                                ? "✓ Xác nhận & Hoàn tất giao dịch"
                                : "✓ Xác nhận phần của tôi"}
                          </Button>
                        ) : (
                          <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                            Bạn đã xác nhận · Chờ bên kia
                          </span>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => setCancelTxId(tx.id)}
                        >
                          Hủy giao dịch
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTxId)}
        onClose={() => setCancelTxId(null)}
        onConfirm={() => void handleCancelTransaction()}
        title="Hủy giao dịch đang tiến hành?"
        description="Giao dịch sẽ chuyển sang Đã hủy và thiết bị liên quan sẽ được mở lại trạng thái Đang bán."
        confirmLabel="Xác nhận hủy giao dịch"
        confirmVariant="danger"
        isLoading={Boolean(busyId)}
      />
    </div>
  );
}
