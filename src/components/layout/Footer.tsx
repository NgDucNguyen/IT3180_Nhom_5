import Link from "next/link";
import { Container } from "./Container";

/**
 * Footer dùng chung toàn ứng dụng.
 * Ghi rõ thông tin dự án Nhóm 5 – Học phần Nhập môn Công nghệ phần mềm (IT3180).
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Thương hiệu & Mô tả dự án */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <span className="text-sm font-bold" aria-hidden>
                  ⚡
                </span>
              </div>
              <span className="text-base font-bold text-white">
                Electro<span className="text-indigo-400">Swap</span> C2C
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Nền tảng thương mại điện tử C2C chuyên biệt cho phép người dùng đăng
              tin mua bán và trao đổi thiết bị điện tử mới hoặc đã qua sử dụng.
            </p>
            <p className="mt-3 inline-block rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
              Nhóm 5 – Học phần Nhập môn Công nghệ phần mềm (IT3180)
            </p>
          </div>

          {/* Cột 2: Khám phá Danh mục (TV2 & TV4) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Danh mục thiết bị
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/listings?category=dien-thoai" className="hover:text-indigo-400">
                  📱 Điện thoại thông minh
                </Link>
              </li>
              <li>
                <Link href="/listings?category=laptop" className="hover:text-indigo-400">
                  💻 Laptop &amp; Máy tính
                </Link>
              </li>
              <li>
                <Link href="/listings?category=may-tinh-bang" className="hover:text-indigo-400">
                  📟 Máy tính bảng
                </Link>
              </li>
              <li>
                <Link href="/listings?category=tai-nghe-dong-ho" className="hover:text-indigo-400">
                  🎧 Tai nghe &amp; Đồng hồ thông minh
                </Link>
              </li>
              <li>
                <Link href="/listings?category=linh-kien-phu-kien" className="hover:text-indigo-400">
                  🔌 Linh kiện &amp; Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Đường dẫn nhanh 8 phân hệ */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Phân hệ chức năng
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/listings" className="hover:text-indigo-400">
                  Khám phá &amp; Tìm kiếm (TV4)
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="hover:text-indigo-400">
                  Đăng tin bán &amp; Tin của tôi (TV3)
                </Link>
              </li>
              <li>
                <Link href="/buyer/requests" className="hover:text-indigo-400">
                  Yêu cầu mua hàng (TV5)
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="hover:text-indigo-400">
                  Đơn bán &amp; Lịch sử giao dịch (TV6)
                </Link>
              </li>
              <li>
                <Link href="/exchanges" className="hover:text-indigo-400">
                  Đề nghị Trao đổi thiết bị (TV7)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-400">
                  Quản trị &amp; Báo cáo vi phạm (TV8)
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin kỹ thuật & Phạm vi */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Kiến trúc &amp; Vận hành
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
              <li>• Next.js 16 (App Router) + TypeScript Strict</li>
              <li>• Tailwind CSS v4 (Design System Indigo/Slate)</li>
              <li>• Prisma 6 ORM + SQLite Local Database</li>
              <li>• Mô hình phân vùng độc lập cho 8 thành viên</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} ElectroSwap C2C — Dự án Nhóm 5 (IT3180 - Nhập môn Công nghệ phần mềm).
          </p>
          <div className="flex items-center gap-4">
            <Link href="/api/categories" className="hover:text-indigo-400">
              API Categories
            </Link>
            <Link href="/api/brands" className="hover:text-indigo-400">
              API Brands
            </Link>
            <Link href="/login" className="hover:text-indigo-400">
              Tài khoản (TV1)
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
