import { ModulePlaceholder } from "@/components/ui";
import { LISTING_STATUS } from "@/lib/constants";

/**
 * Trang khung Đăng tin bán mới — Bàn giao cho TV3 (BA Lead / Module Seller Listing).
 */
export default function CreateListingPage() {
  return (
    <ModulePlaceholder
      memberId="TV3"
      memberRole="BA Lead"
      moduleTitle="Đăng tin bán & Trao đổi thiết bị"
      routePath="/listings/create"
      featureDir="src/features/listing/** · src/app/api/listings/**"
      description="Trang khung dành cho Thành viên 3 xây dựng biểu mẫu đăng tin thiết bị điện tử mới/đã qua sử dụng, nhập bảng thông số kỹ thuật (specsJson) và tùy chọn nhận trao đổi (allowExchange)."
      checklist={[
        "Nhập tiêu đề, mô tả, giá bán (VNĐ), chọn Danh mục (Category) và Thương hiệu (Brand).",
        "Chọn tình trạng phần cứng (NEW, LIKE_NEW, GOOD, FAIR) và nhập thông số kỹ thuật (specsJson).",
        "Bật/tắt tùy chọn Nhận trao đổi (allowExchange) và nhập ghi chú thiết bị muốn đổi (exchangePreference).",
        "Gửi POST /api/listings tạo tin ở trạng thái PENDING chờ Admin duyệt.",
      ]}
      sampleEndpoints={[
        "POST /api/listings",
        "GET  /api/categories",
        "GET  /api/brands",
      ]}
      sampleStatuses={{
        entity: "listing",
        values: [
          LISTING_STATUS.PENDING,
          LISTING_STATUS.ACTIVE,
          LISTING_STATUS.REJECTED,
        ],
      }}
    />
  );
}
