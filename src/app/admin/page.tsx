import { ModulePlaceholder } from "@/components/ui";
import { REPORT_STATUS } from "@/lib/constants";

/**
 * Trang khung Quản trị & Kiểm duyệt — Bàn giao cho TV8 (QA / Test Lead - Admin & Report).
 */
export default function AdminDashboardPage() {
  return (
    <ModulePlaceholder
      memberId="TV8"
      memberRole="QA / Test Lead"
      moduleTitle="Bảng điều khiển Quản trị viên & Xử lý Báo cáo vi phạm"
      routePath="/admin"
      featureDir="src/features/admin/** · src/features/report/** · src/app/admin/** · src/app/api/admin/**"
      description="Trang khung dành cho Thành viên 8 xây dựng công cụ kiểm duyệt tin đăng mới (PENDING -> ACTIVE/REJECTED), quản lý khóa/mở khóa tài khoản người dùng và xử lý báo cáo vi phạm (Report)."
      checklist={[
        "Kiểm tra phân quyền role === 'ADMIN' ở cả giao diện và API route.",
        "Danh sách tin đăng chờ duyệt (PENDING): nút Duyệt (ACTIVE) và Từ chối (REJECTED).",
        "Danh sách Báo cáo vi phạm (Report): cập nhật RESOLVED / DISMISSED kèm ghi chú adminNote.",
        "Quản lý trạng thái tài khoản người dùng (ACTIVE <-> LOCKED).",
      ]}
      sampleEndpoints={[
        "GET   /api/admin/listings?status=PENDING",
        "PATCH /api/admin/listings/[id]/approve",
        "PATCH /api/admin/listings/[id]/reject",
        "GET   /api/reports?status=PENDING",
        "PATCH /api/reports/[id]",
        "PATCH /api/admin/users/[id]/status",
      ]}
      sampleStatuses={{
        entity: "report",
        values: [
          REPORT_STATUS.PENDING,
          REPORT_STATUS.RESOLVED,
          REPORT_STATUS.DISMISSED,
        ],
      }}
    />
  );
}
