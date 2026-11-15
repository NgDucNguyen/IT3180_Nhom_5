# Kế hoạch Kiểm thử Tổng thể (Test Plan) — Sprint 1
**Dự án:** Sàn thương mại điện tử & Trao đổi thiết bị (Nhóm 5)  
**Phụ trách:** Thành viên 8 (QA / Test Lead)

---

## 1. Mục tiêu kiểm thử
- Đảm bảo tính đúng đắn và an toàn cho toàn bộ các luồng nghiệp vụ chính trong Sprint 1 (Xác thực, Danh mục, Đăng tin, Mua hàng, Giao dịch, Trao đổi, và Quản trị hệ thống).
- Kiểm tra chặt chẽ các ràng buộc dữ liệu, quy tắc chuyển đổi trạng thái (State Machine) của tin đăng và cơ chế xử lý báo cáo vi phạm.

## 2. Phạm vi kiểm thử
- **Unit & Integration Test:** Kiểm tra các API endpoint (`/api/reports`, `/api/admin/...`).
- **Functional Testing:** Kiểm thử giao diện và tương tác người dùng trên các module chức năng.
- **Admin Dashboard & Báo cáo vi phạm:** Kiểm tra quyền hạn (Authorization), tính năng kiểm duyệt tin đăng (`PENDING` -> `ACTIVE` / `REJECTED`), xử lý báo cáo (`RESOLVED` / `DISMISSED`) và khóa/mở khóa tài khoản người dùng.

## 3. Chiến lược kiểm thử & Quy tắc chuyển trạng thái
- **Trạng thái tin đăng (Listing State):** Đảm bảo mọi thay đổi trạng thái đều tuân thủ các hàm kiểm tra an toàn (như `assertListingTransition`). Chặn tuyệt đối việc duyệt các tin đã bán (`SOLD`) hoặc không hợp lệ.
- **Module Báo cáo vi phạm (Report):** Chặn không cho phép người dùng tự báo cáo tin đăng của chính mình, đồng thời chặn việc gửi nhiều báo cáo trùng lặp khi đang có báo cáo ở trạng thái `PENDING`.

## 4. Kịch bản Demo cho Sprint 1
1. **Luồng Người dùng:** 
   - Đăng nhập tài khoản, tìm kiếm tin đăng.
   - Thao tác gửi báo cáo vi phạm đối với một tin đăng bất kỳ (kiểm tra chặn tự báo cáo).
2. **Luồng Quản trị viên (Admin - TV8):**
   - Truy cập trang quản trị (`/admin`).
   - Xem danh sách tin đăng chờ duyệt (`PENDING`), thực hiện bấm **Duyệt** (chuyển sang `ACTIVE`) hoặc **Từ chối** (chuyển sang `REJECTED`).
   - Kiểm tra bảng Quản lý Báo cáo vi phạm và cập nhật trạng thái (`RESOLVED`).
   - Thực hiện khóa hoặc mở khóa tài khoản người dùng vi phạm.
