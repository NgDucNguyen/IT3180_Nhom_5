import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { AuthError } from "@/features/auth/errors";
import { BuyerRequestsView } from "@/features/purchase/components/BuyerRequestsView";
import { listPurchaseRequests } from "@/features/purchase/service";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Trang Yêu cầu mua hàng đã gửi (Phía người mua — USER hoặc SELLER đi mua hàng).
 */
export default async function BuyerRequestsPage() {
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
              Tài khoản Quản trị viên không gửi yêu cầu mua
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Bạn đang đăng nhập bằng tài khoản Quản trị viên (ADMIN).
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

  const requests = await listPurchaseRequests(user.id, "sent");

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Hoạt động Mua hàng
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Yêu cầu mua hàng đã gửi
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Theo dõi trạng thái các yêu cầu đặt mua bạn đã gửi tới các Shop.
              {user.role === ROLES.SELLER &&
                " (Chủ Shop vẫn giữ toàn bộ quyền mua hàng từ Shop khác.)"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              🛒 Giỏ hàng
            </Link>
            <Link
              href="/transactions"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
            >
              Đơn &amp; Giao dịch của tôi →
            </Link>
          </div>
        </div>

        <BuyerRequestsView initialRequests={requests} />
      </Container>
    </main>
  );
}
