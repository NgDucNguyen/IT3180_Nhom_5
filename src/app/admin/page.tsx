import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import {
  listAdminListings,
  listAdminReports,
  listAdminUsers,
} from "@/features/admin/service";
import { AuthError } from "@/features/auth/errors";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Trang Quản trị & Kiểm duyệt sàn (Chỉ ADMIN).
 */
export default async function AdminPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }

  if (!user) redirect("/login");

  if (user.role !== ROLES.ADMIN) {
    return (
      <main className="py-12">
        <Container>
          <Card className="mx-auto max-w-lg rounded-2xl border-rose-200 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
              403 · Không có quyền truy cập
            </p>
            <h1 className="mt-2 text-xl font-extrabold text-slate-900">
              Khu vực dành riêng cho Quản trị viên
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tài khoản của bạn hiện có vai trò{" "}
              <strong>{user.role === ROLES.SELLER ? "Chủ Shop" : "Người mua"}</strong>{" "}
              nên không thể truy cập bảng điều khiển kiểm duyệt sàn.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/listings"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
              >
                Khám phá thiết bị
              </Link>
              <Link
                href="/profile"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Về hồ sơ
              </Link>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const [listings, reports, users] = await Promise.all([
    listAdminListings(),
    listAdminReports(),
    listAdminUsers(),
  ]);

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Quản trị viên Hệ thống (ADMIN)
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Kiểm duyệt Sàn &amp; Xử lý Vi phạm
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Duyệt tin đăng mới, xử lý báo cáo từ người mua, gắn huy hiệu Shop
              Uy Tín và quản lý tài khoản trên toàn sàn.
            </p>
          </div>
          <Link
            href="/shops"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem các Shop công khai →
          </Link>
        </div>

        <AdminDashboard
          initialListings={listings}
          initialReports={reports}
          initialUsers={users}
        />
      </Container>
    </main>
  );
}
