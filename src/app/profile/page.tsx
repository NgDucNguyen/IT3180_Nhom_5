import { ModulePlaceholder } from "@/components/ui";
import { USER_STATUS } from "@/lib/constants";

/**
 * Trang khung Hồ sơ cá nhân — Bàn giao cho TV1 (PM / Module Auth & Profile).
 */
export default function ProfilePage() {
  return (
    <ModulePlaceholder
      memberId="TV1"
      memberRole="PM / Scrum Master"
      moduleTitle="Hồ sơ cá nhân & Cài đặt tài khoản"
      routePath="/profile"
      featureDir="src/features/auth/** · src/app/profile/** · src/lib/auth.ts"
      description="Trang khung dành cho Thành viên 1 phát triển giao diện xem và cập nhật thông tin cá nhân (Họ tên, Số điện thoại, Ảnh đại diện, Vai trò USER/ADMIN)."
      checklist={[
        "Hiển thị thông tin người dùng hiện tại từ GET /api/auth/me.",
        "Form cập nhật fullName, phone, avatarUrl (không lộ passwordHash).",
        "Nút Đăng xuất xóa httpOnly cookie và điều hướng về trang chủ.",
      ]}
      sampleEndpoints={[
        "GET   /api/auth/me",
        "PATCH /api/profile",
        "POST  /api/auth/logout",
      ]}
      sampleStatuses={{
        entity: "user",
        values: [USER_STATUS.ACTIVE, USER_STATUS.LOCKED],
      }}
    />
  );
}
