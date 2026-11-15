export const AUTH_CHANGED_EVENT = "elade:auth-changed";
export const CART_CHANGED_EVENT = "elade:cart-changed";

/** Thông báo Navbar và các thành phần UI đồng bộ lại phiên đăng nhập hiện tại. */
export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/** Thông báo Navbar và nút giỏ hàng đồng bộ lại danh sách giỏ hàng. */
export function notifyCartChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_CHANGED_EVENT));
  }
}
