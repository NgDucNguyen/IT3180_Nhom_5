import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card, StatusBadge } from "@/components/ui";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { AuthError } from "@/features/auth/errors";
import { CartView } from "@/features/cart";
import { getUserCart } from "@/features/cart/service";
import { getCurrentUser } from "@/lib/auth";
import { USER_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof AuthError) || error.status !== 403) throw error;
    return (
      <main className="py-12">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-extrabold text-slate-900">
                  Tài khoản đã bị khóa
                </h1>
                <StatusBadge
                  status={USER_STATUS.LOCKED}
                  entity="user"
                  size="md"
                />
              </div>
              <p className="mt-3 mb-5 text-sm leading-relaxed text-slate-600">
                Vui lòng liên hệ quản trị viên hoặc đăng xuất để sử dụng tài
                khoản khác.
              </p>
              <LogoutButton />
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  if (!user) redirect("/login");

  const initialCart = await getUserCart(user.id);

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Giỏ hàng cá nhân
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Thiết bị đã lưu vào giỏ hàng
            </h1>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Tài khoản: {user.fullName}
          </span>
        </div>

        <CartView initialCart={initialCart} />
      </Container>
    </main>
  );
}
