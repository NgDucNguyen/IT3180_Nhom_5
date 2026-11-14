# `src/components/layout` — Khung giao diện

**Chủ sở hữu: TV4 (UI/UX Lead).** Người khác chỉ import, không sửa.

## Thành phần

| File | Mô tả |
|---|---|
| `navbar.tsx` | Logo, menu (Trang chủ, Đăng tin, Tin của tôi…), nút đăng nhập/đăng xuất |
| `footer.tsx` | Thông tin nhóm, liên kết |
| `container.tsx` | Giới hạn chiều rộng, padding thống nhất |

## Quy tắc

- `Navbar` hiển thị trạng thái đăng nhập dựa trên `GET /api/auth/me` (TV1).
- Khi chưa có auth (Sprint 1), hiển thị nút "Đăng nhập" tĩnh.
- TV4 import các component này vào `src/app/layout.tsx`.
