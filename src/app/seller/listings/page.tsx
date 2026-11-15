import Link from "next/link";
import { Container } from "@/components/layout";
import { SellerListings } from "@/features/listing/components/SellerListings";
import { requireListingPageUser } from "@/features/listing/page-auth";
import { getSellerListings } from "@/features/listing/service";
import { isListingStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireListingPageUser();
  const rawParams = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["page", "status"] as const) {
    const value = rawParams[key];
    if (typeof value === "string") params.set(key, value);
  }
  const statusValue = params.get("status");
  const status = statusValue && isListingStatus(statusValue) ? statusValue : undefined;
  if (!status) params.delete("status");
  const result = await getSellerListings(user.id, params);
  return (
    <main className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-5xl space-y-6">
          {user.shop && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-5 py-3.5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Kênh Người Bán · {user.shop.name}
                </p>
                <p className="text-xs text-slate-600">
                  📍 {user.shop.city} · {user.shop.isVerified ? "✓ Shop đã xác minh" : "Shop đang hoạt động"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/shops/${user.shop.slug}`}
                  className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                >
                  🏪 Xem Trang Shop
                </Link>
                <Link
                  href="/seller/shop"
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ⚙️ Chỉnh sửa Shop
                </Link>
                <Link
                  href="/transactions"
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  📦 Đơn khách đặt
                </Link>
              </div>
            </div>
          )}

          <SellerListings result={result} status={status} created={rawParams.created === "1"} />
        </div>
      </Container>
    </main>
  );
}
