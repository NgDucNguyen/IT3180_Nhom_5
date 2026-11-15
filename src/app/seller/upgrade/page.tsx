import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { Card } from "@/components/ui";
import { ShopSetupForm } from "@/features/shop";
import { AuthError } from "@/features/auth/errors";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SellerUpgradePage() {
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
      <main className="py-12">
        <Container>
          <Card className="mx-auto max-w-lg rounded-3xl p-6 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-900">
              Tài khoản Quản trị viên
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tài khoản Admin thực hiện kiểm duyệt và quản trị toàn sàn, không
              mở Shop bán hàng.
            </p>
            <div className="mt-5">
              <Link
                href="/admin"
                className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
              >
                Đi tới Bảng điều khiển Admin
              </Link>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  if (user.role === ROLES.SELLER && user.shop) {
    return (
      <main className="py-12">
        <Container>
          <Card className="mx-auto max-w-xl rounded-3xl p-7 shadow-sm">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              ✓ Đã kích hoạt Kênh Người Bán
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
              Shop của bạn đã sẵn sàng: {user.shop.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Bạn vừa có thể quản lý gian hàng, đăng bán thiết bị và vẫn đi mua
              hàng ở các Shop khác như bình thường.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/shops/${user.shop.slug}`}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                🏪 Xem Trang Shop công khai
              </Link>
              <Link
                href="/seller/shop"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ⚙️ Chỉnh sửa Shop
              </Link>
              <Link
                href="/seller/listings"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                📦 Quản lý sản phẩm
              </Link>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Nâng cấp tài khoản · Kênh Bán Hàng
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Mở Shop Người bán trên Elade
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tài khoản <strong>{user.fullName}</strong> đang là Người mua. Chỉ
              cần thiết lập thông tin Shop bên dưới, bạn sẽ sở hữu gian hàng
              riêng và <strong>vẫn giữ nguyên 100% quyền đi mua hàng</strong> ở
              mọi Shop khác.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white bg-white/90 p-3.5 shadow-2xs">
                <span className="text-base">🏪</span>
                <p className="mt-1 text-xs font-bold text-slate-900">
                  Trang Shop riêng
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Banner, danh mục, lịch sử đã bán giúp tăng uy tín với khách.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/90 p-3.5 shadow-2xs">
                <span className="text-base">🔄</span>
                <p className="mt-1 text-xs font-bold text-slate-900">
                  Đăng bán &amp; Trao đổi
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Nhận đơn mua trực tiếp hoặc giao lưu đổi thiết bị với khách.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/90 p-3.5 shadow-2xs">
                <span className="text-base">🛒</span>
                <p className="mt-1 text-xs font-bold text-slate-900">
                  Song song đi mua hàng
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Vẫn dùng giỏ hàng, gửi yêu cầu mua tại các Shop khác bình thường.
                </p>
              </div>
            </div>
          </div>

          <ShopSetupForm mode="upgrade" defaultPhone={user.phone} />
        </div>
      </Container>
    </main>
  );
}
