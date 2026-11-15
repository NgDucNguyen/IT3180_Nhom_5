import type { ListingCardItem } from "@/components/ui";

/** Thông tin thiết bị nằm trong một mục giỏ hàng. */
export interface CartListingDTO extends ListingCardItem {
  status: string;
  seller: {
    id: string;
    fullName: string;
  };
}

/** Một dòng mục trong giỏ hàng của người dùng. */
export interface CartItemDTO {
  id: string;
  listingId: string;
  createdAt: string;
  available: boolean;
  listing: CartListingDTO;
}

/** Tổng hợp giỏ hàng trả về từ API GET /api/cart và SSR /cart. */
export interface CartSummaryDTO {
  items: CartItemDTO[];
  totalCount: number;
  availableCount: number;
  totalAmount: number;
}

/** Thông tin user an toàn dùng chung cho Navbar & Session Context. */
export interface SessionUserDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
}
