"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "./Container";

export interface NavItem {
  label: string;
  href: string;
  owner: string;
  badge?: string;
}

/**
 * Danh sách điều hướng chuẩn cho đủ 8 thành viên trong nhóm.
 * Giữ cố định để 7 thành viên còn lại không phải sửa Navbar (tránh Merge Conflict).
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Khám phá", href: "/listings", owner: "TV4" },
  { label: "Tin của tôi", href: "/seller/listings", owner: "TV3" },
  { label: "Yêu cầu mua", href: "/buyer/requests", owner: "TV5" },
  { label: "Đơn bán & Giao dịch", href: "/transactions", owner: "TV6" },
  { label: "Đề nghị Trao đổi", href: "/exchanges", owner: "TV7", badge: "Swap" },
  { label: "Admin", href: "/admin", owner: "TV8" },
];

/**
 * Thanh điều hướng chính (Shared Navbar) — Tông màu Indigo / Slate chuyên nghiệp.
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/listings") {
      return pathname === "/listings" || (pathname.startsWith("/listings/") && !pathname.startsWith("/listings/create"));
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-slate-100 shadow-md">
      {/* Top bar: Logo + Thanh tìm kiếm nhanh + Khu vực Đăng tin / Tài khoản */}
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo ElectroSwap C2C */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-lg font-extrabold tracking-tighter" aria-hidden>
                ⚡
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">
                  Electro<span className="text-indigo-400">Swap</span>
                </span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-400/30">
                  C2C
                </span>
              </div>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                Mua bán &amp; Trao đổi thiết bị công nghệ
              </span>
            </div>
          </Link>

          {/* Thanh tìm kiếm nhanh (Desktop & Tablet) */}
          <form
            action="/listings"
            method="GET"
            className="hidden max-w-md flex-1 md:flex"
            role="search"
          >
            <div className="relative flex w-full items-center">
              <input
                type="search"
                name="q"
                placeholder="Tìm iPhone, MacBook, Galaxy, tai nghe Sony..."
                aria-label="Tìm kiếm thiết bị điện tử"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/90 py-2 pl-3.5 pr-20 text-sm text-slate-100 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                className="absolute right-1.5 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Cụm nút hành động bên phải: Đăng tin bán (TV3) + Hồ sơ / Đăng nhập (TV1) */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              href="/listings/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              <span aria-hidden>＋</span>
              <span>Đăng tin bán</span>
            </Link>

            <div className="h-5 w-px bg-slate-700" aria-hidden />

            <Link
              href="/profile"
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive("/profile")
                  ? "bg-slate-800 text-indigo-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Hồ sơ
            </Link>

            <Link
              href="/login"
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isActive("/login")
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700"
              }`}
            >
              Đăng nhập
            </Link>
          </div>

          {/* Nút bật/tắt menu trên Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Mở menu điều hướng"
          >
            <span className="text-base font-bold leading-none">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </Container>

      {/* Sub-navigation bar: Điều hướng 8 phân hệ trên Desktop */}
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

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>🔄 Hỗ trợ Mua bán &amp; Đổi máy trực tiếp</span>
              <span className="text-slate-600">•</span>
              <Link
                href="/listings?allowExchange=true"
                className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Xem máy nhận trao đổi →
              </Link>
            </div>
          </nav>
        </Container>
      </div>

      {/* Menu Responsive trên Mobile & Tablet */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 pb-4 pt-3 lg:hidden">
          <Container>
            {/* Tìm kiếm nhanh trên mobile */}
            <form action="/listings" method="GET" className="mb-3">
              <div className="flex gap-2">
                <input
                  type="search"
                  name="q"
                  placeholder="Tìm thiết bị điện tử..."
                  aria-label="Tìm thiết bị điện tử"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Tìm
                </button>
              </div>
            </form>

            {/* Danh sách link các phân hệ */}
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
                    <span className="text-[11px] text-slate-400">{item.owner}</span>
                  </Link>
                );
              })}

              <div className="my-2 border-t border-slate-800 pt-2">
                <Link
                  href="/listings/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <span>＋ Đăng tin bán thiết bị (TV3)</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-700 bg-slate-800 py-2 text-center text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Hồ sơ cá nhân (TV1)
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 py-2 text-center text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                  >
                    Đăng nhập (TV1)
                  </Link>
                </div>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
