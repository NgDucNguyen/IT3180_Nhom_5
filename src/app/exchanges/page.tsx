import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { AuthError } from "@/features/auth/errors";
import { ExchangesWorkspace } from "@/features/exchange/components/ExchangesWorkspace";
import { listExchangeOffers } from "@/features/exchange/service";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Trang quản lý Đề nghị Trao đổi thiết bị (ExchangeOffer).
 */
export default async function ExchangesPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }

  if (!user) redirect("/login");

  if (user.role === ROLES.ADMIN) {
    return (
      <main className="py-10">
        <Container>
          <Card className="mx-auto max-w-lg rounded-2xl p-6 text-center">
            <h1 className="text-lg font-bold text-slate-900">
              Tài khoản Quản trị viên không tham gia trao đổi
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Quản trị viên phụ trách kiểm duyệt tin đăng, xử lý báo cáo vi phạm và
              quản trị hệ thống.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
            >
              Về trang Admin →
            </Link>
          </Card>
        </Container>
      </main>
    );
  }

  const offers = await listExchangeOffers(user.id, "all");

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Trao đổi thiết bị C2C
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Đề nghị Trao đổi
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Đổi trực tiếp 1 thiết bị ACTIVE của Shop bạn lấy thiết bị từ Shop
              khác kèm tiền bù minh bạch.
            </p>
          </div>
          <Link
            href="/transactions"
            className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Xem Giao dịch &amp; Xác nhận 2 chiều →
          </Link>
        </div>

        <ExchangesWorkspace
          currentUserId={user.id}
          currentUserRole={user.role}
          initialOffers={offers}
        />
      </Container>
    </main>
  );
}
