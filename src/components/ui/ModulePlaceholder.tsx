import Link from "next/link";
import { Container } from "@/components/layout";
import { StatusBadge } from "./StatusBadge";

export interface ModulePlaceholderProps {
  memberId: string;
  memberRole: string;
  moduleTitle: string;
  routePath: string;
  featureDir: string;
  description: string;
  checklist: string[];
  sampleEndpoints?: string[];
  sampleStatuses?: {
    entity:
      | "listing"
      | "purchaseRequest"
      | "exchangeOffer"
      | "transaction"
      | "report"
      | "user";
    values: string[];
  };
}

/**
 * ModulePlaceholder — Trang khung (Placeholder Page) chuẩn Design System
 * dành cho các route của TV1, TV3, TV5, TV6, TV7, TV8.
 * Giúp các thành viên vào đúng thư mục của mình code tiếp mà không cần sửa
 * layout.tsx hay Navbar chung (tránh Merge Conflict).
 *
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function ModulePlaceholder({
  memberId,
  memberRole,
  moduleTitle,
  routePath,
  featureDir,
  description,
  checklist,
  sampleEndpoints = [],
  sampleStatuses,
}: ModulePlaceholderProps) {
  return (
    <main className="py-10">
      <Container>
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          {/* Header Banner */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 ring-1 ring-indigo-400/30">
                {memberId} · {memberRole}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 font-mono text-xs text-slate-300">
                Route: {routePath}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {moduleTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              {description}
            </p>
          </div>

          {/* Body hướng dẫn tích hợp cho thành viên phụ trách */}
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
            {/* Cột 1: Phạm vi tính năng cần hiện thực */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                📋 Đầu việc của {memberId} tại trang này
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-indigo-600" aria-hidden>
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột 2: Vùng code & API liên quan */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">
                  🗂 Phân vùng sở hữu (AGENTS.md)
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Thư mục tính năng được phép chỉnh sửa của{" "}
                  <strong className="text-slate-900">{memberId}</strong>:
                </p>
                <code className="mt-1.5 block rounded-lg border border-indigo-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-indigo-700">
                  {featureDir}
                </code>

                {sampleEndpoints.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-700">
                      Endpoints API dự kiến:
                    </p>
                    <ul className="mt-1.5 space-y-1 font-mono text-xs text-slate-600">
                      {sampleEndpoints.map((ep) => (
                        <li
                          key={ep}
                          className="rounded bg-white/80 px-2 py-1 ring-1 ring-slate-200"
                        >
                          {ep}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {sampleStatuses && (
                <div className="border-t border-indigo-100 pt-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">
                    Component{" "}
                    <code className="font-mono text-indigo-700">
                      &lt;StatusBadge /&gt;
                    </code>{" "}
                    đã dựng sẵn cho {memberId}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleStatuses.values.map((st) => (
                      <StatusBadge
                        key={st}
                        status={st}
                        entity={sampleStatuses.entity}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer điều hướng nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-600 sm:px-8">
            <span>
              💡 Khung giao diện được khởi tạo bởi{" "}
              <strong>TV4 (UI/UX Lead)</strong> để chống xung đột Git.
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/listings"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                ← Quay lại Khám phá sản phẩm
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Trang chủ
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
