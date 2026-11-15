"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppSession } from "@/features/cart";
import { ROLES } from "@/lib/constants";
import { Container } from "./Container";
import { EladeLogo } from "./EladeLogo";

export interface NavItem {
  label: string;
  href: string;
  owner: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Khám phá", href: "/listings", owner: "TV4" },
  { label: "Tin của tôi", href: "/seller/listings", owner: "TV3" },
  { label: "Yêu cầu mua", href: "/buyer/requests", owner: "TV5" },
  { label: "Đơn bán & Giao dịch", href: "/transactions", owner: "TV6" },
  { label: "Đề nghị Trao đổi", href: "/exchanges", owner: "TV7", badge: "Swap" },
  { label: "Admin", href: "/admin", owner: "TV8" },
];

function CartIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/**
 * Thanh điều hướng chính (Shared Navbar) — Logo Elade, Giỏ hàng,
 * cụm Tài khoản/Hồ sơ (hoặc Đăng ký / Đăng nhập khi chưa login)
 * và thanh điều hướng các phân hệ (MAIN_NAV_ITEMS).
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authLoading, cartCount, logout } = useAppSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/listings") {
      return (
        pathname === "/listings" ||
        (pathname.startsWith("/listings/") &&
          !pathname.startsWith("/listings/create"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    const ok = await logout();
    setLoggingOut(false);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    if (ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  const userInitial = user?.fullName?.trim().charAt(0).toUpperCase() || "U";
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-slate-100 shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo Elade (Electronic + Trade) */}
          <Link
            href="/"
            className="group flex shrink-0 items-center focus:outline-none"
          >
            <EladeLogo size="md" />
          </Link>

          {/* Cụm nút bên phải Desktop: Giỏ hàng + Hồ sơ người dùng (hoặc Đăng ký / Đăng nhập) */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              href="/cart"
              className={`relative inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isActive("/cart")
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                  : "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              }`}
              aria-label="Giỏ hàng"
            >
              <CartIcon />
              <span>Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {authLoading ? (
              <div
                aria-hidden="true"
                className="h-8 w-36 animate-pulse rounded-lg bg-slate-800"
              />
            ) : user ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 text-left transition ${
                    isActive("/profile") || profileMenuOpen
                      ? "border-indigo-400 bg-slate-800 text-white"
                      : "border-slate-700 bg-slate-800/90 text-slate-100 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-white">
                    {userInitial}
                  </span>
                  <span className="max-w-36 truncate text-xs font-semibold">
                    {user.fullName}
                  </span>
                  {isAdmin && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                      Admin
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400" aria-hidden>
                    {profileMenuOpen ? "▲" : "▼"}
                  </span>
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl ring-1 ring-black/20"
                  >
                    <div className="border-b border-slate-800 px-3 py-2.5">
                      <p className="truncate text-xs font-bold text-white">
                        {user.fullName}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/profile"
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                      >
                        <span>👤 Hồ sơ người dùng</span>
                        <span className="text-slate-500">→</span>
                      </Link>
                      <Link
                        href="/cart"
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                      >
                        <span>🛒 Giỏ hàng của tôi</span>
                        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                          {cartCount}
                        </span>
                      </Link>
                      <Link
                        href="/seller/listings"
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                      >
                        <span>📦 Quản lý tin đăng</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={loggingOut}
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:opacity-50"
                      >
                        <span>
                          {loggingOut ? "Đang đăng xuất..." : "🚪 Đăng xuất"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive("/register")
                      ? "bg-slate-800 text-indigo-300"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  Đăng ký
                </Link>

                <Link
                  href="/login"
                  className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive("/login")
                      ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                      : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>

          {/* Cụm Mobile: Giỏ hàng nhanh + nút mở menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/cart"
              aria-label="Giỏ hàng"
              className="relative inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 py-0.5 text-[10px] font-bold leading-none text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-expanded={mobileMenuOpen}
              aria-label="Mở menu điều hướng"
            >
              <span className="text-base font-bold leading-none">
                {mobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>
      </Container>

      {/* Thanh điều hướng các phân hệ trên Desktop */}
      <div className="hidden border-t border-slate-800/80 bg-slate-950/60 lg:block">
        <Container>
          <nav
            aria-label="Điều hướng phân hệ"
            className="flex items-center justify-between py-1.5 text-xs"
          >
            <ul className="flex items-center gap-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                        active
                          ? "bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-violet-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-violet-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </div>

      {/* Menu Responsive trên Mobile & Tablet */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 pb-4 pt-3 lg:hidden">
          <Container>
            <nav aria-label="Menu di động" className="grid gap-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-indigo-600/20 text-indigo-300"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {user ? (
                <div className="my-2 space-y-2 border-t border-slate-800 pt-3">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white">
                        {userInitial}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Xem hồ sơ người dùng
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">→</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 py-2 text-center text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20"
                    >
                      🛒 Giỏ hàng ({cartCount})
                    </Link>
                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={() => void handleLogout()}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-center text-xs font-semibold text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      {loggingOut ? "Đang thoát..." : "Đăng xuất"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="my-2 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-700 bg-slate-800 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 py-2 text-center text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
