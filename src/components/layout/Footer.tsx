import Link from "next/link";
import { Container } from "./Container";
import { EladeLogo } from "./EladeLogo";

/**
 * Footer dùng chung toàn ứng dụng.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Cột 1: Thương hiệu & Mô tả dự án */}
          <div className="max-w-md">
            <EladeLogo size="sm" suffix="C2C" />
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Nền tảng thương mại điện tử C2C chuyên biệt cho phép người dùng đăng
              tin mua bán và trao đổi thiết bị điện tử mới hoặc đã qua sử dụng.
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
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Elade C2C</p>
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
