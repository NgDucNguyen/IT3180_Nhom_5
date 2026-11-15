"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_CHANGED_EVENT,
  CART_CHANGED_EVENT,
  notifyAuthChanged,
  notifyCartChanged,
} from "@/features/cart/events";
import type { CartSummaryDTO, SessionUserDTO } from "@/features/cart/types";

interface ApiEnvelope<T> {
  data?: T;
  error?: { code?: string; message?: string };
}

interface AppSessionContextValue {
  user: SessionUserDTO | null;
  authLoading: boolean;
  cartCount: number;
  cartListingIds: Set<string>;
  refreshAll: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (
    listingId: string,
  ) => Promise<{ ok: boolean; unauthenticated?: boolean; message?: string }>;
  removeFromCart: (
    listingId: string,
  ) => Promise<{ ok: boolean; unauthenticated?: boolean; message?: string }>;
  logout: () => Promise<boolean>;
}

const DEFAULT_CONTEXT: AppSessionContextValue = {
  user: null,
  authLoading: false,
  cartCount: 0,
  cartListingIds: new Set<string>(),
  refreshAll: async () => {},
  refreshCart: async () => {},
  addToCart: async () => ({ ok: false, message: "Chưa khởi tạo phiên." }),
  removeFromCart: async () => ({ ok: false, message: "Chưa khởi tạo phiên." }),
  logout: async () => false,
};

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

/**
 * Provider dùng chung toàn ứng dụng để đồng bộ user đăng nhập và số lượng giỏ hàng
 * trên Navbar, ListingCard, trang chi tiết và /cart chỉ với 1 lượt gọi API.
 */
export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUserDTO | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [cartListingIds, setCartListingIds] = useState<Set<string>>(new Set());

  const fetchCartForUser = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        setCartListingIds(new Set());
        return;
      }
      const body = (await response.json()) as ApiEnvelope<CartSummaryDTO>;
      const ids = new Set((body.data?.items ?? []).map((item) => item.listingId));
      setCartListingIds(ids);
    } catch {
      setCartListingIds(new Set());
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        setUser(null);
        setCartListingIds(new Set());
        return;
      }
      const body = (await response.json()) as ApiEnvelope<SessionUserDTO>;
      const currentUser = body.data ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchCartForUser();
      } else {
        setCartListingIds(new Set());
      }
    } catch {
      setUser(null);
      setCartListingIds(new Set());
    } finally {
      setAuthLoading(false);
    }
  }, [fetchCartForUser]);

  const refreshCart = useCallback(async () => {
    await fetchCartForUser();
  }, [fetchCartForUser]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const onAuthChanged = () => {
      void refreshAll();
    };
    const onCartChanged = () => {
      void fetchCartForUser();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
    };
  }, [refreshAll, fetchCartForUser]);

  const addToCart = useCallback(async (listingId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const body = (await response.json()) as ApiEnvelope<{
        totalCount?: number;
      }>;
      if (response.status === 401) {
        return {
          ok: false,
          unauthenticated: true,
          message: body.error?.message ?? "Vui lòng đăng nhập để thêm vào giỏ hàng.",
        };
      }
      if (!response.ok) {
        return {
          ok: false,
          message: body.error?.message ?? "Không thể thêm vào giỏ hàng.",
        };
      }
      setCartListingIds((prev) => {
        const next = new Set(prev);
        next.add(listingId);
        return next;
      });
      notifyCartChanged();
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      };
    }
  }, []);

  const removeFromCart = useCallback(async (listingId: string) => {
    try {
      const response = await fetch(
        `/api/cart/${encodeURIComponent(listingId)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );
      const body = (await response.json()) as ApiEnvelope<{
        listingId?: string;
      }>;
      if (response.status === 401) {
        return {
          ok: false,
          unauthenticated: true,
          message: body.error?.message ?? "Vui lòng đăng nhập.",
        };
      }
      if (!response.ok) {
        return {
          ok: false,
          message: body.error?.message ?? "Không thể xóa khỏi giỏ hàng.",
        };
      }
      setCartListingIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
      notifyCartChanged();
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) return false;
      setUser(null);
      setCartListingIds(new Set());
      notifyAuthChanged();
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<AppSessionContextValue>(
    () => ({
      user,
      authLoading,
      cartCount: cartListingIds.size,
      cartListingIds,
      refreshAll,
      refreshCart,
      addToCart,
      removeFromCart,
      logout,
    }),
    [
      user,
      authLoading,
      cartListingIds,
      refreshAll,
      refreshCart,
      addToCart,
      removeFromCart,
      logout,
    ],
  );

  return (
    <AppSessionContext.Provider value={value}>
      {children}
    </AppSessionContext.Provider>
  );
}

/** Đọc trạng thái đăng nhập và giỏ hàng dùng chung. */
export function useAppSession(): AppSessionContextValue {
  return useContext(AppSessionContext) ?? DEFAULT_CONTEXT;
}
