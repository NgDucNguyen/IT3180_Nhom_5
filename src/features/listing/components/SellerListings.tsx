"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, ConfirmDialog, EmptyState, Modal, Pagination, PriceText, StatusBadge, getStatusBadgeMeta } from "@/components/ui";
import { LISTING_STATUS, LISTING_STATUS_VALUES, type ListingStatus } from "@/lib/constants";
import { isListingEditable } from "@/lib/listing-state";
import { listingApi } from "../api";
import type { SellerListing, SellerListingsResult } from "../types";
import { ListingForm } from "./ListingForm";

export function SellerListings({ result, status, created = false }: {
  result: SellerListingsResult;
  status?: ListingStatus;
  created?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SellerListing | null>(null);
  const [visibilityTarget, setVisibilityTarget] = useState<SellerListing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(created ? "Đã tạo tin đăng. Tin đang chờ quản trị viên duyệt." : "");

  function saved(listing: SellerListing) {
    setEditing(null);
    setNotice(listing.status === LISTING_STATUS.PENDING ? "Đã lưu tin đăng và gửi chờ duyệt." : "Đã lưu thay đổi.");
    setError("");
    router.refresh();
  }

  async function toggleVisibility() {
    if (!visibilityTarget || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const listing = await listingApi<SellerListing>(`/api/listings/${visibilityTarget.id}/hide`, { method: "PATCH" });
      setNotice(listing.status === LISTING_STATUS.HIDDEN ? "Đã ẩn tin đăng." : "Đã bỏ ẩn tin đăng.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setBusy(false);
      setVisibilityTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Góc người bán</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Tin đăng của tôi</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi trạng thái và quản lý các thiết bị bạn đã đăng.</p>
        </div>
        <Link href="/listings/create" className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-500">
          + Đăng tin mới
        </Link>
      </div>
      <nav aria-label="Lọc trạng thái tin đăng" className="flex flex-wrap gap-2">
        {[undefined, ...LISTING_STATUS_VALUES].map((value) => (
          <Link key={value ?? "all"} href={value ? `/seller/listings?status=${value}` : "/seller/listings"}
            aria-current={status === value ? "page" : undefined}
            className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${status === value
              ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"}`}>
            {value ? getStatusBadgeMeta(value, "listing").label : "Tất cả"}
          </Link>
        ))}
      </nav>
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <p className="text-sm text-slate-500">{result.total} tin đăng{status ? ` · ${getStatusBadgeMeta(status, "listing").label}` : ""}</p>
      {result.items.length === 0 ? (
        <EmptyState icon="📋" title={status ? "Chưa có tin ở trạng thái này" : "Chưa có tin đăng"}
          description={status ? "Chọn trạng thái khác để xem tin đăng của bạn." : "Đăng thiết bị đầu tiên để bắt đầu bán hoặc nhận đề nghị trao đổi."}
          actionLabel={status ? "Xem tất cả tin" : "Đăng tin đầu tiên"} actionHref={status ? "/seller/listings" : "/listings/create"} />
      ) : (
        <div className="space-y-4">
          {result.items.map((listing) => {
            const editable = isListingEditable(listing.status);
            const canToggle = listing.status === LISTING_STATUS.ACTIVE || listing.status === LISTING_STATUS.HIDDEN;
            const canViewPublic = listing.status === LISTING_STATUS.ACTIVE || !editable;
            return (
              <article key={listing.id} aria-label={listing.title}>
                <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={listing.status} entity="listing" />
                      <StatusBadge status={listing.condition} entity="condition" />
                      {listing.allowExchange && <span className="text-xs font-semibold text-violet-600">Nhận trao đổi</span>}
                    </div>
                    <h2 className="wrap-break-word text-base font-bold text-slate-900">{listing.title}</h2>
                    <p className="text-xs text-slate-500">{listing.category.name}{listing.brand ? ` · ${listing.brand.name}` : ""}
                      {" · "}Đăng ngày {new Date(listing.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
                    <PriceText amount={listing.price} />
                    {!editable && <p className="text-xs text-slate-500">Tin đang giao dịch hoặc đã hoàn tất nên không thể sửa/ẩn.</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {canViewPublic && <Link href={`/listings/${listing.id}`} className="rounded-xl px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">Xem tin</Link>}
                    {editable && <Button variant="outline" size="sm" disabled={busy} onClick={() => { setError(""); setEditing(listing); }}>Sửa tin</Button>}
                    {canToggle && <Button variant="outline" size="sm" disabled={busy} onClick={() => setVisibilityTarget(listing)}>
                      {listing.status === LISTING_STATUS.HIDDEN ? "Bỏ ẩn" : "Ẩn tin"}
                    </Button>}
                  </div>
                </Card>
              </article>
            );
          })}
        </div>
      )}
      <Pagination currentPage={result.page} totalPages={Math.max(1, Math.ceil(result.total / result.limit))}
        basePath="/seller/listings" searchParams={{ status }} />
      <Modal open={Boolean(editing)} onClose={() => { if (!busy) setEditing(null); }} title="Chỉnh sửa tin đăng" size="xl">
        {editing && <ListingForm key={editing.id} listing={editing} onSaved={saved}
          onCancel={() => setEditing(null)} onBusyChange={setBusy} />}
      </Modal>
      <ConfirmDialog open={Boolean(visibilityTarget)} onClose={() => { if (!busy) setVisibilityTarget(null); }}
        onConfirm={toggleVisibility} isLoading={busy}
        title={visibilityTarget?.status === LISTING_STATUS.HIDDEN ? "Bỏ ẩn tin đăng?" : "Ẩn tin đăng?"}
        confirmLabel={visibilityTarget?.status === LISTING_STATUS.HIDDEN ? "Bỏ ẩn tin" : "Ẩn tin"}
        description={visibilityTarget?.status === LISTING_STATUS.HIDDEN
          ? "Tin sẽ hiển thị lại và có thể nhận yêu cầu mua hoặc trao đổi."
          : "Tin sẽ tạm dừng hiển thị công khai. Bạn có thể bỏ ẩn sau."} />
    </div>
  );
}
