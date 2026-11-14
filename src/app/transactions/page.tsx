import { ModulePlaceholder } from "@/components/ui";
import { TRANSACTION_STATUS } from "@/lib/constants";

/**
 * Trang khung Đơn bán & Lịch sử giao dịch — Bàn giao cho TV6 (Workflow Analyst - Giao dịch).
 */
export default function TransactionsPage() {
  return (
    <ModulePlaceholder
      memberId="TV6"
      memberRole="Workflow Analyst (Luồng Giao dịch)"
      moduleTitle="Xử lý Đơn mua & Lịch sử Giao dịch (Transaction)"
      routePath="/transactions"
      featureDir="src/features/transaction/** · src/app/transactions/** · src/app/my-transactions/** · src/app/api/transactions/**"
      description="Trang khung dành cho Thành viên 6 xử lý chấp nhận/từ chối yêu cầu mua từ phía người bán, khóa trạng thái thiết bị (IN_TRANSACTION) chống double-booking và xác nhận hoàn tất giao dịch 2 chiều."
      checklist={[
        "Người bán Chấp nhận / Từ chối PurchaseRequest (tạo Transaction trong prisma.$transaction và chuyển Listing sang IN_TRANSACTION).",
        "Xác nhận 2 phía: buyerConfirmed và sellerConfirmed trước khi chuyển Transaction sang COMPLETED.",
        "Khi COMPLETED: cập nhật Listing.status sang SOLD (mua) hoặc EXCHANGED (trao đổi).",
        "Khi CANCELLED: mở khóa Listing quay về trạng thái ACTIVE.",
      ]}
      sampleEndpoints={[
        "POST  /api/purchase-requests/[id]/accept",
        "POST  /api/purchase-requests/[id]/reject",
        "GET   /api/transactions?role=buyer|seller",
        "PATCH /api/transactions/[id]/confirm",
        "PATCH /api/transactions/[id]/cancel",
      ]}
      sampleStatuses={{
        entity: "transaction",
        values: [
          TRANSACTION_STATUS.IN_PROGRESS,
          TRANSACTION_STATUS.COMPLETED,
          TRANSACTION_STATUS.CANCELLED,
        ],
      }}
    />
  );
}
