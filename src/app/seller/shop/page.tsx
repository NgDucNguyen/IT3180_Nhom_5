import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout";
import { ShopSetupForm } from "@/features/shop";
import { getMyShop } from "@/features/shop/service";
import { AuthError } from "@/features/auth/errors";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SellerShopSettingsPage() {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }

  if (!user) redirect("/login");
  if (user.role !== ROLES.SELLER) redirect("/seller/upgrade");

  const shop = await getMyShop(user.id);
  if (!shop) redirect("/seller/upgrade");

  return (
    <main className="py-8 sm:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Kênh Người Bán
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                Tùy chỉnh Trang Shop của bạn
              </h1>
            </div>
            <Link
              href={`/shops/${shop.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
            >
              🏪 Xem Trang Shop công khai →
            </Link>
          </div>

          <ShopSetupForm
            mode="edit"
            initialShop={shop}
            defaultPhone={user.phone}
          />
        </div>
      </Container>
    </main>
  );
}
