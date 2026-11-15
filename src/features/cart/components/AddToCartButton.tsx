"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useAppSession } from "./AppSessionProvider";

export interface AddToCartButtonProps {
  listingId: string;
  sellerId?: string | null;
  disabled?: boolean;
  variant?: "card" | "detail";
}

/**
 * Nút "Thêm vào giỏ hàng" dùng chung trên ListingCard và trang chi tiết (/listings/[id]).
 * Nếu chưa đăng nhập -> chuyển tới /login. Nếu đã thêm -> cho phép bỏ khỏi giỏ hoặc mở /cart.
 */
export function AddToCartButton({
  listingId,
  sellerId,
  disabled = false,
  variant = "card",
}: AddToCartButtonProps) {
  const router = useRouter();
  const { user, cartListingIds, addToCart, removeFromCart } = useAppSession();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const isOwnListing = Boolean(user && sellerId && user.id === sellerId);
  const inCart = cartListingIds.has(listingId);

  async function handleToggle() {
    if (pending || disabled || isOwnListing) return;
    setPending(true);
    setFeedback("");

    const result = inCart
      ? await removeFromCart(listingId)
      : await addToCart(listingId);

    setPending(false);

    if (result.unauthenticated) {
      router.push("/login");
      return;
    }

    if (!result.ok && result.message) {
      setFeedback(result.message);
    }
  }

  if (isOwnListing) {
    if (variant === "card") {
      return (
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          Tin của bạn
        </span>
      );
    }
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-600">
        Đây là thiết bị do chính bạn đăng bán.
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending || disabled}
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            inCart
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100"
          }`}
          title={inCart ? "Bấm để bỏ khỏi giỏ hàng" : "Thêm thiết bị vào giỏ hàng"}
        >
          <span aria-hidden>{inCart ? "✓" : "🛒"}</span>
          <span>
            {pending
              ? "Đang lưu..."
              : inCart
                ? "Trong giỏ"
                : "Thêm vào giỏ"}
          </span>
        </button>
        {feedback && (
          <span className="text-[10px] font-medium text-rose-600">
            {feedback}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={inCart ? "secondary" : "outline"}
          size="md"
          fullWidth={!inCart}
          disabled={pending || disabled}
          onClick={handleToggle}
          className={inCart ? "flex-1" : ""}
        >
          <span aria-hidden>{inCart ? "✓" : "🛒"}</span>
          <span>
            {pending
              ? "Đang cập nhật..."
              : inCart
                ? "Đã lưu trong giỏ (Bấm để bỏ)"
                : "Thêm vào giỏ hàng"}
          </span>
        </Button>

        {inCart && (
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            Xem giỏ hàng →
          </Link>
        )}
      </div>

      {feedback && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {feedback}
        </p>
      )}
    </div>
  );
}
