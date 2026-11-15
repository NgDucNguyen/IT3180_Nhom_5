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

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Khám phá", href: "/listings", owner: "TV4" },
  { label: "Tin của tôi", href: "/seller/listings", owner: "TV3" },
  { label: "Yêu cầu mua", href: "/buyer/requests", owner: "TV5" },
  { label: "Đơn bán & Giao dịch", href: "/transactions", owner: "TV6" },
  { label: "Đề nghị Trao đổi", href: "/exchanges", owner: "TV7", badge: "Swap" },
  { label: "Admin", href: "/admin", owner: "TV8" },
];

/**
 * Thanh điều hướng chính (Shared Navbar) — Logo ElectroSwap, Đăng ký / Đăng nhập
 * và thanh điều hướng các phân hệ (MAIN_NAV_ITEMS).
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-slate-100 shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo ElectroSwap */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-lg font-extrabold tracking-tighter" aria-hidden>
                ⚡
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              El<span className="text-indigo-400">ade</span>
            </span>
          </Link>

          {/* Cụm nút bên phải: Đăng ký (trái) + Đăng nhập (phải) */}
          <div className="hidden items-center gap-2.5 lg:flex">
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
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
