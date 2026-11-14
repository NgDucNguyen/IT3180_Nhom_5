import { ModulePlaceholder } from "@/components/ui";
import { EXCHANGE_OFFER_STATUS } from "@/lib/constants";

/**
 * Trang khung Đề nghị Trao đổi thiết bị — Bàn giao cho TV7 (BA/Designer - Luồng Trao đổi).
 */
export default function ExchangesPage() {
  return (
    <ModulePlaceholder
      memberId="TV7"
      memberRole="BA / Designer (Luồng Trao đổi)"
      moduleTitle="Quản lý Đề nghị Trao đổi thiết bị (ExchangeOffer)"
      routePath="/exchanges"
      featureDir="src/features/exchange/** · src/app/exchanges/** · src/app/exchange/** · src/app/api/exchange-offers/**"
      description="Trang khung dành cho Thành viên 7 xây dựng quy trình đổi thiết bị Y của người đề nghị lấy thiết bị X của chủ tin (kèm tiền bù cashTopUp), xử lý chấp nhận/từ chối và khóa đồng thời 2 thiết bị."
      checklist={[
        "Hiển thị danh sách Đề nghị trao đổi đã gửi (box=sent) và đã nhận (box=received).",
        "Kiểm tra ràng buộc: proposerId !== receiverId, cả 2 thiết bị X và Y đều ACTIVE, thiết bị X bật allowExchange = true.",
        "Khi người nhận Chấp nhận: tạo Transaction(type=EXCHANGE) và khóa đồng thời cả 2 Listing sang IN_TRANSACTION.",
        "Hỗ trợ từ chối hoặc hủy đề nghị trao đổi khi còn ở trạng thái PENDING.",
      ]}
      sampleEndpoints={[
        "POST  /api/exchange-offers",
        "GET   /api/exchange-offers?box=sent|received",
        "PATCH /api/exchange-offers/[id]/accept",
        "PATCH /api/exchange-offers/[id]/reject",
        "PATCH /api/exchange-offers/[id]/cancel",
      ]}
      sampleStatuses={{
        entity: "exchangeOffer",
        values: [
          EXCHANGE_OFFER_STATUS.PENDING,
          EXCHANGE_OFFER_STATUS.ACCEPTED,
          EXCHANGE_OFFER_STATUS.REJECTED,
          EXCHANGE_OFFER_STATUS.CANCELLED,
        ],
      }}
    />
  );
}
