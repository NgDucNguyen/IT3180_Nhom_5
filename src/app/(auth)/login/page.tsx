import { ModulePlaceholder } from "@/components/ui";
import { USER_STATUS } from "@/lib/constants";

/**
 * Trang khung Đăng nhập / Đăng ký — Bàn giao cho TV1 (PM / Module Auth).
 */
export default function LoginPage() {
  return (
    <ModulePlaceholder
      memberId="TV1"
      memberRole="PM / Scrum Master"
      moduleTitle="Đăng nhập & Xác thực tài khoản"
      routePath="/login"
      featureDir="src/features/auth/** · src/app/(auth)/** · src/app/api/auth/**"
      description="Trang khung dành cho Thành viên 1 xây dựng chức năng Đăng nhập, Đăng ký tài khoản (bcryptjs cost 10) và quản lý phiên đăng nhập bằng JWT trong httpOnly cookie."
      checklist={[
        "Form Đăng nhập bằng email & mật khẩu (validate đầu vào).",
        "Form Đăng ký tài khoản mới và tự động tạo phiên đăng nhập.",
        "Lưu JWT trong httpOnly cookie (tuyệt đối không lưu localStorage).",
        "Hiển thị thông tin tài khoản demo (an@nhom5.vn, binh@nhom5.vn, admin@nhom5.vn).",
      ]}
      sampleEndpoints={[
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/auth/logout",
        "GET  /api/auth/me",
      ]}
      sampleStatuses={{
        entity: "user",
        values: [USER_STATUS.ACTIVE, USER_STATUS.LOCKED],
      }}
    />
  );
}
