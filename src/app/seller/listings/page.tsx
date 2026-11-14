import { ModulePlaceholder } from "@/components/ui";
import { LISTING_STATUS } from "@/lib/constants";

/**
 * Trang khung Quản lý tin đăng của tôi — Bàn giao cho TV3 (BA Lead / Module Seller Listing).
 */
export default function SellerListingsPage() {
  return (
    <ModulePlaceholder
      memberId="TV3"
      memberRole="BA Lead"
      moduleTitle="Quản lý Tin đăng của tôi"
      routePath="/seller/listings"
      featureDir="src/features/listing/** · src/app/seller/listings/** · src/app/my-listings/**"
      description="Trang khung dành cho Thành viên 3 xây dựng danh sách quản lý các thiết bị người bán đã đăng: xem trạng thái duyệt, chỉnh sửa thông tin, ẩn/bỏ ẩn tin đăng."
      checklist={[
        "Hiển thị danh sách tin đăng của người dùng hiện tại theo từng trạng thái.",
        "Chỉnh sửa nội dung tin đăng (nếu tin đang ACTIVE sửa xong phải đưa về PENDING duyệt lại).",
        "Chặn chỉnh sửa khi tin đang ở trạng thái IN_TRANSACTION, SOLD hoặc EXCHANGED.",
        "Chức năng Ẩn tin (ACTIVE -> HIDDEN) và Bỏ ẩn (HIDDEN -> ACTIVE).",
      ]}
      sampleEndpoints={[
        "GET    /api/listings?mine=true",
        "PATCH  /api/listings/[id]",
        "PATCH  /api/listings/[id]/hide",
        "DELETE /api/listings/[id]",
      ]}
      sampleStatuses={{
        entity: "listing",
        values: [
          LISTING_STATUS.PENDING,
          LISTING_STATUS.ACTIVE,
          LISTING_STATUS.IN_TRANSACTION,
          LISTING_STATUS.SOLD,
          LISTING_STATUS.EXCHANGED,
          LISTING_STATUS.HIDDEN,
          LISTING_STATUS.REJECTED,
        ],
      }}
    />
  );
}
