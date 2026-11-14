import { ModulePlaceholder } from "@/components/ui";
import { PURCHASE_REQUEST_STATUS } from "@/lib/constants";

/**
 * Trang khung Yêu cầu mua hàng (Phía người mua) — Bàn giao cho TV5 (Workflow Analyst - Mua).
 */
export default function BuyerRequestsPage() {
  return (
    <ModulePlaceholder
      memberId="TV5"
      memberRole="Workflow Analyst (Luồng Mua)"
      moduleTitle="Quản lý Yêu cầu mua hàng đã gửi"
      routePath="/buyer/requests"
      featureDir="src/features/purchase/** · src/app/buyer/requests/** · src/app/my-requests/** · src/app/api/purchase-requests/**"
      description="Trang khung dành cho Thành viên 5 xây dựng chức năng theo dõi các yêu cầu mua (PurchaseRequest) mà người mua đã gửi cho người bán, kèm chức năng hủy yêu cầu khi còn ở trạng thái PENDING."
      checklist={[
        "Hiển thị danh sách PurchaseRequest của người mua hiện tại kèm thông tin Listing và giá đề nghị (offeredPrice).",
        "Kiểm tra điều kiện khi gửi yêu cầu: không tự mua tin của chính mình, không gửi trùng yêu cầu PENDING trên cùng thiết bị.",
        "Hỗ trợ nút Hủy yêu cầu (PENDING -> CANCELLED) sử dụng canTransitionPurchaseRequest.",
      ]}
      sampleEndpoints={[
        "POST  /api/purchase-requests",
        "GET   /api/purchase-requests?mine=true",
        "PATCH /api/purchase-requests/[id]/cancel",
      ]}
      sampleStatuses={{
        entity: "purchaseRequest",
        values: [
          PURCHASE_REQUEST_STATUS.PENDING,
          PURCHASE_REQUEST_STATUS.ACCEPTED,
          PURCHASE_REQUEST_STATUS.REJECTED,
          PURCHASE_REQUEST_STATUS.CANCELLED,
        ],
      }}
    />
  );
}
