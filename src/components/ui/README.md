# `src/components/ui` — Bộ UI kit dùng chung

**Chủ sở hữu: TV4 (UI/UX Lead).** Không ai khác sửa file trong thư mục này —
chỉ **import** component.

## Component cần xây (gợi ý)

| Component | Dùng ở đâu |
|---|---|
| `Button` | Toàn bộ |
| `Input`, `Textarea`, `Select` | Form đăng nhập, đăng tin |
| `Card` | Danh sách tin, chi tiết tin |
| `Badge` | Trạng thái tin, tình trạng thiết bị |
| `Pagination` | Danh sách tin |
| `EmptyState`, `ErrorState`, `PageLoader` | Mọi màn hình |
| `Modal`, `ConfirmDialog` | Xác nhận ẩn tin / huỷ giao dịch |
| `PriceText` | Định dạng VND thống nhất |

## Quy ước

- Mỗi component 1 file: `src/components/ui/button.tsx` export `Button`.
- Không chứa logic gọi API.
- Nhận prop `className` để tuỳ biến.
- Dùng Tailwind, lấy màu từ token trong `src/app/globals.css`.
