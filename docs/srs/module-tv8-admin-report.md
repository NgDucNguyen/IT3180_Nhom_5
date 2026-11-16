# Đặc tả Phân hệ Quản trị & Báo cáo vi phạm (Admin & Report)
**Thành viên phụ trách:** Thành viên 8 (TV8)

---

## 1. Tổng quan phân hệ
Phân hệ này cung cấp công cụ cho Quản trị viên (Admin) để kiểm soát chất lượng nội dung trên sàn, xử lý các phản hồi vi phạm từ người dùng, quản lý trạng thái tài khoản và duyệt tin đăng mới.

## 2. Chi tiết Use Case

### UC-REP-01: Người dùng gửi báo cáo vi phạm
- **Mô tả:** Cho phép người dùng gửi khiếu nại/báo cáo đối với một tin đăng vi phạm quy định.
- **API Endpoint:** `POST /api/reports`
- **Ràng buộc nghiệp vụ:**
  - Người dùng không được phép tự báo cáo tin đăng do chính mình tạo ra.
  - Hệ thống chặn báo cáo trùng lặp nếu đã tồn tại một báo cáo ở trạng thái `PENDING` từ cùng một người cho cùng một tin đăng đó.

### UC-ADM-01: Admin duyệt hoặc từ chối tin đăng mới
- **Mô tả:** Admin xem danh sách tin đăng đang chờ duyệt (`PENDING`) và thực hiện duyệt xuất bản hoặc từ chối.
- **API Endpoint:** 
  - `GET /api/admin/listings` (Lọc danh sách tin chờ duyệt)
  - `PATCH /api/admin/listings/[id]/approve` (Chuyển `PENDING` -> `ACTIVE`)
  - `PATCH /api/admin/listings/[id]/reject` (Chuyển `PENDING` -> `REJECTED`)

### UC-ADM-02: Admin xử lý báo cáo vi phạm
- **Mô tả:** Admin xem danh sách báo cáo, cập nhật trạng thái xử lý kèm theo ghi chú (`adminNote`).
- **API Endpoint:** `GET /api/reports` & `PATCH /api/reports/[id]`
- **Trạng thái hỗ trợ:** `RESOLVED` (Đã giải quyết, có thể ẩn tin vi phạm) hoặc `DISMISSED` (Bác bỏ báo cáo).

### UC-ADM-03: Admin quản lý tài khoản người dùng
- **Mô tả:** Admin xem danh sách thành viên và thực hiện khóa hoặc mở khóa tài khoản khi có vi phạm.
- **API Endpoint:** `GET /api/admin/users` & `PATCH /api/admin/users/[id]/status`
- **Trạng thái tài khoản:** Chuyển đổi qua lại giữa `ACTIVE` và `LOCKED`.
