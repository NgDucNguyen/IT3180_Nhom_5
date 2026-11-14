import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * TRANG CHỦ TẠM (BASE PLACEHOLDER)
 *
 * Đây là trang chứng minh toàn bộ chuỗi công nghệ đã thông:
 * Next.js App Router -> Prisma -> SQLite -> render dữ liệu seed.
 *
 * ⚠️ TV4 (UI/UX Lead) SẼ THAY THẾ TRANG NÀY bằng trang Khám phá thật
 * (danh sách sản phẩm + tìm kiếm + bộ lọc). Trang hiện tại chỉ để cả nhóm
 * xác nhận môi trường chạy đúng.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, brands, listingCount] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.listing.count(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 border-b border-border-subtle pb-6">
        <p className="text-sm font-medium text-primary">
          IT3180 · Nhóm 5 · Base Project
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Chợ Thiết Bị Điện Tử
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mua bán và trao đổi thiết bị điện tử đã qua sử dụng. Đây là trang tạm
          để kiểm tra môi trường — TV4 sẽ thay bằng trang Khám phá.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Danh mục" value={categories.length} />
        <StatCard label="Thương hiệu" value={brands.length} />
        <StatCard label="Tin đăng" value={listingCount} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Danh mục</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border border-border-subtle bg-white p-4"
            >
              <span className="text-xl" aria-hidden>
                {category.icon ?? "📦"}
              </span>
              <p className="mt-1 font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Thương hiệu</h2>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <span
              key={brand.id}
              className="rounded-full border border-border-subtle bg-white px-3 py-1 text-sm"
            >
              {brand.name}
            </span>
          ))}
        </div>
      </section>

      <footer className="mt-12 flex flex-wrap gap-4 border-t border-border-subtle pt-6 text-sm">
        <Link className="text-primary underline" href="/api/categories">
          GET /api/categories
        </Link>
        <Link className="text-primary underline" href="/api/brands">
          GET /api/brands
        </Link>
        <span className="text-muted-foreground">
          Xem AGENTS.md để biết phân vùng code của từng thành viên.
        </span>
      </footer>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
