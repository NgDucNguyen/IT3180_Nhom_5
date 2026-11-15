"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  PriceText,
  StatusBadge,
} from "@/components/ui";
import {
  LISTING_STATUS,
  REPORT_STATUS,
  ROLES,
  USER_STATUS,
} from "@/lib/constants";
import type {
  listAdminListings,
  listAdminReports,
  listAdminUsers,
} from "@/features/admin/service";

export type AdminListingItem = Awaited<ReturnType<typeof listAdminListings>>[number];
export type AdminReportItem = Awaited<ReturnType<typeof listAdminReports>>[number];
export type AdminUserItem = Awaited<ReturnType<typeof listAdminUsers>>[number];

export interface AdminDashboardProps {
  initialListings: AdminListingItem[];
  initialReports: AdminReportItem[];
  initialUsers: AdminUserItem[];
}

export function AdminDashboard({
  initialListings,
  initialReports,
  initialUsers,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<"listings" | "reports" | "users">("listings");
  const [listings, setListings] = useState<AdminListingItem[]>(initialListings);
  const [reports, setReports] = useState<AdminReportItem[]>(initialReports);
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);

  const [listingFilter, setListingFilter] = useState<string>("ALL");
  const [reportFilter, setReportFilter] = useState<string>("ALL");

  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [rejectWithReport, setRejectWithReport] = useState<
    Record<string, boolean>
  >({});

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const pendingListingCount = listings.filter(
    (l) => l.status === LISTING_STATUS.PENDING,
  ).length;
  const pendingReportCount = reports.filter(
    (r) => r.status === REPORT_STATUS.PENDING,
  ).length;
  const verifiedShopCount = users.filter((u) => u.shop?.isVerified).length;
  const totalShopCount = users.filter((u) => u.shop !== null).length;

  async function handleModerateListing(
    listingId: string,
    action: "approve" | "reject",
  ) {
    if (busyKey) return;
    setBusyKey(`listing:${listingId}`);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/${action}`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      const body = (await response.json()) as {
        data?: { id: string; title: string; status: string };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể cập nhật trạng thái tin đăng.");
        return;
      }
      setListings((prev) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, status: body.data!.status } : item,
        ),
      );
      setNotice(
        action === "approve"
          ? `Đã duyệt tin "${body.data.title}" lên sàn (ACTIVE).`
          : `Đã từ chối / gỡ tin "${body.data.title}" (REJECTED).`,
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleResolveReport(
    reportId: string,
    status: "RESOLVED" | "DISMISSED",
  ) {
    if (busyKey) return;
    setBusyKey(`report:${reportId}`);
    setError("");
    setNotice("");
    const rejectListing = Boolean(rejectWithReport[reportId]);
    const adminNote = (reportNotes[reportId] ?? "").trim();

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: adminNote || undefined,
          rejectListing,
        }),
      });
      const body = (await response.json()) as {
        data?: {
          id: string;
          status: string;
          adminNote: string | null;
          listingId: string;
        };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể xử lý báo cáo.");
        return;
      }

      setReports((prev) =>
        prev.map((item) =>
          item.id === reportId
            ? {
                ...item,
                status: body.data!.status,
                adminNote: body.data!.adminNote,
                listing: rejectListing
                  ? { ...item.listing, status: LISTING_STATUS.REJECTED }
                  : item.listing,
              }
            : item,
        ),
      );
      if (rejectListing) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === body.data!.listingId
              ? { ...l, status: LISTING_STATUS.REJECTED }
              : l,
          ),
        );
      }
      setNotice(
        status === "RESOLVED"
          ? rejectListing
            ? "Đã xác nhận vi phạm & gỡ tin đăng liên quan."
            : "Đã đánh dấu báo cáo là đã xử lý (RESOLVED)."
          : "Đã bỏ qua báo cáo (DISMISSED).",
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleUserStatus(userItem: AdminUserItem) {
    if (busyKey) return;
    const nextStatus =
      userItem.status === USER_STATUS.ACTIVE
        ? USER_STATUS.LOCKED
        : USER_STATUS.ACTIVE;
    setBusyKey(`user:${userItem.id}`);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/users/${userItem.id}/status`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const body = (await response.json()) as {
        data?: { id: string; fullName: string; status: string };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể cập nhật trạng thái tài khoản.");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userItem.id ? { ...u, status: body.data!.status } : u,
        ),
      );
      setNotice(
        nextStatus === USER_STATUS.LOCKED
          ? `Đã khóa tài khoản ${userItem.fullName}.`
          : `Đã mở khóa tài khoản ${userItem.fullName}.`,
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleVerifyShop(
    userId: string,
    shopId: string,
    shopName: string,
    currentVerified: boolean,
  ) {
    if (busyKey) return;
    setBusyKey(`shop:${shopId}`);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/shops/${shopId}/verify`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentVerified }),
      });
      const body = (await response.json()) as {
        data?: { id: string; name: string; isVerified: boolean };
        error?: { message?: string };
      };
      if (!response.ok || !body.data) {
        setError(body.error?.message ?? "Không thể cập nhật huy hiệu Shop.");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId && u.shop
            ? { ...u, shop: { ...u.shop, isVerified: body.data!.isVerified } }
            : u,
        ),
      );
      setNotice(
        body.data.isVerified
          ? `Đã gắn huy hiệu Shop Uy Tín cho ${shopName}.`
          : `Đã gỡ huy hiệu Shop Uy Tín khỏi ${shopName}.`,
      );
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setBusyKey(null);
    }
  }

  const filteredListings =
    listingFilter === "ALL"
      ? listings
      : listings.filter((l) => l.status === listingFilter);
  const filteredReports =
    reportFilter === "ALL"
      ? reports
      : reports.filter((r) => r.status === reportFilter);

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-amber-200/80 bg-amber-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Tin chờ kiểm duyệt
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {pendingListingCount}
            <span className="ml-1.5 text-xs font-medium text-slate-500">
              / {listings.length} tin
            </span>
          </p>
        </Card>

        <Card className="rounded-2xl border-rose-200/80 bg-rose-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Báo cáo vi phạm chờ xử lý
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {pendingReportCount}
            <span className="ml-1.5 text-xs font-medium text-slate-500">
              / {reports.length} báo cáo
            </span>
          </p>
        </Card>

        <Card className="rounded-2xl border-indigo-200/80 bg-indigo-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Người dùng &amp; Shop
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {users.length} tài khoản
            <span className="ml-1.5 text-xs font-medium text-slate-500">
              ({totalShopCount} Shop · {verifiedShopCount} Uy tín)
            </span>
          </p>
        </Card>
      </div>

      {/* Tabs chuyển phân hệ */}
      <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("listings")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            tab === "listings"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Kiểm duyệt tin đăng
          {pendingListingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
              {pendingListingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("reports")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            tab === "reports"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Báo cáo vi phạm
          {pendingReportCount > 0 && (
            <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              {pendingReportCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("users")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            tab === "users"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Người dùng &amp; Shop ({users.length})
        </button>
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
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {notice}
        </div>
      )}

      {/* TAB 1: KIỂM DUYỆT TIN ĐĂNG */}
      {tab === "listings" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: LISTING_STATUS.PENDING, label: "Chờ duyệt (PENDING)" },
              { id: LISTING_STATUS.ACTIVE, label: "Đang bán (ACTIVE)" },
              { id: LISTING_STATUS.REJECTED, label: "Từ chối (REJECTED)" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setListingFilter(item.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  listingFilter === item.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredListings.length === 0 ? (
            <EmptyState
              icon="✅"
              title="Không có tin đăng nào ở bộ lọc này"
              description="Các tin mới do Chủ Shop đăng sẽ xuất hiện ở trạng thái PENDING để Admin kiểm duyệt."
            />
          ) : (
            <div className="space-y-3">
              {filteredListings.map((item) => {
                const canApprove = item.status === LISTING_STATUS.PENDING;
                const canReject =
                  item.status === LISTING_STATUS.PENDING ||
                  item.status === LISTING_STATUS.ACTIVE ||
                  item.status === LISTING_STATUS.HIDDEN;

                return (
                  <Card
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} entity="listing" />
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {item.category.name}
                          {item.brand ? ` · ${item.brand.name}` : ""}
                        </span>
                        {item.seller.shop && (
                          <Link
                            href={`/shops/${item.seller.shop.slug}`}
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            🏪 {item.seller.shop.name}
                            {item.seller.shop.isVerified && " ✓"}
                          </Link>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        <Link
                          href={`/listings/${item.id}`}
                          className="hover:text-indigo-600"
                        >
                          {item.title}
                        </Link>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <PriceText amount={item.price} size="sm" />
                        <span>Người bán: {item.seller.fullName}</span>
                        <span>
                          Đăng lúc{" "}
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {canApprove && (
                        <Button
                          size="sm"
                          disabled={busyKey === `listing:${item.id}`}
                          onClick={() => handleModerateListing(item.id, "approve")}
                        >
                          {busyKey === `listing:${item.id}`
                            ? "Đang duyệt..."
                            : "Duyệt lên sàn"}
                        </Button>
                      )}
                      {canReject && (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busyKey === `listing:${item.id}`}
                          onClick={() => handleModerateListing(item.id, "reject")}
                        >
                          {item.status === LISTING_STATUS.PENDING
                            ? "Từ chối"
                            : "Gỡ tin"}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BÁO CÁO VI PHẠM */}
      {tab === "reports" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: REPORT_STATUS.PENDING, label: "Chờ xử lý (PENDING)" },
              { id: REPORT_STATUS.RESOLVED, label: "Đã xử lý (RESOLVED)" },
              { id: REPORT_STATUS.DISMISSED, label: "Bỏ qua (DISMISSED)" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setReportFilter(item.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  reportFilter === item.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <EmptyState
              icon="🛡️"
              title="Chưa có báo cáo vi phạm nào"
              description="Khi người dùng báo cáo tin đăng có dấu hiệu lừa đảo hoặc sai mô tả, danh sách sẽ hiển thị tại đây."
            />
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const isPending = report.status === REPORT_STATUS.PENDING;
                const shop = report.listing.seller.shop;

                return (
                  <Card
                    key={report.id}
                    className="rounded-2xl border-slate-200 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={report.status} entity="report" />
                        <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                          Lý do: {report.reason}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(report.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-slate-500">Tin bị báo cáo:</span>
                        <Link
                          href={`/listings/${report.listing.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {report.listing.title}
                        </Link>
                        <StatusBadge
                          status={report.listing.status}
                          entity="listing"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Người báo cáo: <strong>{report.reporter.fullName}</strong> (
                        {report.reporter.email}) · Chủ tin:{" "}
                        <strong>
                          {shop ? shop.name : report.listing.seller.fullName}
                        </strong>
                      </p>
                      {report.description && (
                        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                          {report.description}
                        </p>
                      )}
                      {report.adminNote && (
                        <p className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-800">
                          <strong>Ghi chú Admin:</strong> {report.adminNote}
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <input
                            type="text"
                            placeholder="Ghi chú hướng xử lý của Admin (tùy chọn)..."
                            value={reportNotes[report.id] ?? ""}
                            onChange={(e) =>
                              setReportNotes((prev) => ({
                                ...prev,
                                [report.id]: e.target.value,
                              }))
                            }
                            className="h-9 rounded-xl border border-slate-300 px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                          />

                          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(rejectWithReport[report.id])}
                              onChange={(e) =>
                                setRejectWithReport((prev) => ({
                                  ...prev,
                                  [report.id]: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 rounded border-slate-300 text-rose-600"
                            />
                            Gỡ tin này (REJECTED)
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={busyKey === `report:${report.id}`}
                            onClick={() =>
                              handleResolveReport(report.id, "RESOLVED")
                            }
                          >
                            Đánh dấu đã xử lý (RESOLVED)
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busyKey === `report:${report.id}`}
                            onClick={() =>
                              handleResolveReport(report.id, "DISMISSED")
                            }
                          >
                            Bỏ qua (DISMISSED)
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NGƯỜI DÙNG & SHOP */}
      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u) => {
            const isAdmin = u.role === ROLES.ADMIN;
            const roleLabel =
              u.role === ROLES.ADMIN
                ? "Quản trị viên"
                : u.role === ROLES.SELLER
                  ? "Chủ Shop"
                  : "Người mua";
            const roleClass =
              u.role === ROLES.ADMIN
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : u.role === ROLES.SELLER
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <Card
                key={u.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border-slate-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${roleClass}`}
                    >
                      {roleLabel}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        u.status === USER_STATUS.ACTIVE
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {u.status === USER_STATUS.ACTIVE ? "Hoạt động" : "Đã khóa"}
                    </span>
                    {u.shop && (
                      <Link
                        href={`/shops/${u.shop.slug}`}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100"
                      >
                        🏪 {u.shop.name}
                        {u.shop.isVerified && " · ✓ Uy Tín"}
                      </Link>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {u.fullName}{" "}
                    <span className="font-normal text-slate-500">({u.email})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    SĐT: {u.phone ?? "Chưa cập nhật"} · Tin đăng:{" "}
                    <strong>{u._count.listings}</strong> · Đơn mua:{" "}
                    <strong>{u._count.purchaseRequests}</strong>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {u.shop && (
                    <Button
                      size="sm"
                      variant={u.shop.isVerified ? "secondary" : "primary"}
                      disabled={busyKey === `shop:${u.shop.id}`}
                      onClick={() =>
                        handleToggleVerifyShop(
                          u.id,
                          u.shop!.id,
                          u.shop!.name,
                          u.shop!.isVerified,
                        )
                      }
                    >
                      {u.shop.isVerified ? "Gỡ huy hiệu Uy Tín" : "✓ Xác minh Shop"}
                    </Button>
                  )}

                  {!isAdmin && (
                    <Button
                      size="sm"
                      variant={
                        u.status === USER_STATUS.ACTIVE ? "danger" : "secondary"
                      }
                      disabled={busyKey === `user:${u.id}`}
                      onClick={() => handleToggleUserStatus(u)}
                    >
                      {u.status === USER_STATUS.ACTIVE
                        ? "Khóa tài khoản"
                        : "Mở khóa"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
