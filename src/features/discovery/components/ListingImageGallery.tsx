"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";

export interface ListingImageGalleryProps {
  title: string;
  images: string[];
  condition: string;
  status: string;
  allowExchange: boolean;
}

/**
 * ListingImageGallery — Bộ sưu tập hình ảnh tương tác trên trang Chi tiết thiết bị (/listings/[id]).
 * Cho phép chuyển đổi ảnh đại diện khi thiết bị có nhiều góc chụp, kèm nhãn tình trạng và trao đổi.
 *
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export function ListingImageGallery({
  title,
  images,
  condition,
  status,
  allowExchange,
}: ListingImageGalleryProps) {
  const safeImages =
    images.length > 0 ? images : ["/images/placeholder-device.svg"];
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const activeImage = safeImages[selectedIndex] ?? safeImages[0];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Khung ảnh chính */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={activeImage}
          alt={`${title} - hình ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition duration-300"
        />

        {/* Cụm nhãn góc trên bên trái: Tình trạng vật lý & Trạng thái tin */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            status={condition}
            entity="condition"
            size="md"
            className="bg-white/95 shadow-xs"
          />
          <StatusBadge
            status={status}
            entity="listing"
            size="md"
            className="bg-white/95 shadow-xs"
          />
        </div>

        {/* Nhãn góc trên bên phải: Nhận trao đổi */}
        {allowExchange && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <span aria-hidden>🔄</span>
              <span>Nhận trao đổi (Trade-in)</span>
            </span>
          </div>
        )}

        {/* Bộ đếm ảnh góc dưới bên phải */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
          Ảnh {selectedIndex + 1} / {safeImages.length}
        </div>
      </div>

      {/* Dải ảnh thu nhỏ (Thumbnails) */}
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pt-1">
          {safeImages.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Xem ảnh ${idx + 1} của ${title}`}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-500/25"
                    : "border-slate-200 opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${title} - ảnh thu nhỏ ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
