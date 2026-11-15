import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { AuthError } from "@/features/auth/errors";
import { listPurchaseRequests } from "@/features/purchase/service";
import { TransactionsWorkspace } from "@/features/transaction/components/TransactionsWorkspace";
import { listUserTransactions } from "@/features/transaction/service";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Trang Đơn bán nhận được & Lịch sử giao dịch xác nhận 2 chiều.
 */
export default async function TransactionsPage() {
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
              Tài khoản Quản trị viên không có giao dịch mua bán
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Vui lòng truy cập trang Quản trị để kiểm duyệt tin đăng và xử lý báo
              cáo vi phạm.
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

  const [incomingRequests, transactions] = await Promise.all([
    user.role === ROLES.SELLER
      ? listPurchaseRequests(user.id, "received")
      : Promise.resolve([]),
    listUserTransactions(user.id, "all"),
  ]);

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Quy trình Giao dịch Minh bạch
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Đơn bán &amp; Giao dịch của tôi
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {user.role === ROLES.SELLER
                ? "Duyệt yêu cầu mua gửi tới Shop của bạn và xác nhận giao dịch 2 chiều (cả chiều Mua lẫn chiều Bán)."
                : "Theo dõi giao dịch khi Shop chấp nhận đơn của bạn và xác nhận hoàn tất 2 chiều để đánh dấu đã mua."}
            </p>
          </div>
          {user.role === ROLES.USER ? (
            <Link
              href="/seller/upgrade"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
            >
              🚀 Nâng cấp thành Shop để bán hàng
            </Link>
          ) : (
            <Link
              href="/seller/listings"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kênh Người bán →
            </Link>
          )}
        </div>

        <TransactionsWorkspace
          currentUserId={user.id}
          currentUserRole={user.role}
          initialIncomingRequests={incomingRequests}
          initialTransactions={transactions}
        />
      </Container>
    </main>
  );
}
