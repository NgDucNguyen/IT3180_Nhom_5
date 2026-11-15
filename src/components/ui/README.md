# `src/components/ui` — Bộ UI Kit dùng chung toàn sàn ElectroSwap C2C

**Chủ sở hữu: TV4 (UI/UX Lead).** Không ai khác sửa file trong thư mục này — các thành viên chỉ **import** component từ `@/components/ui`.

---

## 1. Danh mục 13 Component đã hoàn thiện

| Component | File | Dùng ở đâu |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | Nút bấm toàn hệ thống (`primary`, `secondary`, `outline`, `exchange`, `danger`, `ghost`) |
| `Input` | `src/components/ui/Input.tsx` | Ô nhập văn bản / số có sẵn `label`, `error`, `helperText`, `leftAddon`, `rightAddon` |
| `Textarea` | `src/components/ui/Textarea.tsx` | Ô nhập nhiều dòng (mô tả thiết bị TV3, lời nhắn mua TV5, mô tả báo cáo TV8) |
| `Select` | `src/components/ui/Select.tsx` | Hộp chọn dropdown (danh mục, thương hiệu, tình trạng, lý do báo cáo) |
| `Card` | `src/components/ui/Card.tsx` | Khung thẻ chứa nội dung trắng viền `slate-200` |
| `StatusBadge` (`Badge`) | `src/components/ui/StatusBadge.tsx` | Nhãn trạng thái màu sắc thống nhất cho `Listing`, `Condition`, `PurchaseRequest`, `ExchangeOffer`, `Transaction`, `Report`, `User` |
| `PriceText` | `src/components/ui/PriceText.tsx` | Định dạng tiền VNĐ thống nhất (`formatPriceVnd`) |
| `ListingCard` | `src/components/ui/ListingCard.tsx` | Thẻ hiển thị sản phẩm điện tử chuẩn trên toàn sàn |
| `Pagination` | `src/components/ui/Pagination.tsx` | Thanh phân trang bảo toàn query params |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Hiển thị khi danh sách rỗng |
| `ErrorState` | `src/components/ui/ErrorState.tsx` | Hiển thị khi có lỗi tải dữ liệu kèm nút thử lại |
| `PageLoader` | `src/components/ui/PageLoader.tsx` | Khung Skeleton đang tải dữ liệu (dùng cho `loading.tsx`) |
| `Modal` | `src/components/ui/Modal.tsx` | Hộp thoại nổi (Dialog) hỗ trợ đóng bằng phím `Escape` |
| `ConfirmDialog` | `src/components/ui/ConfirmDialog.tsx` | Hộp thoại xác nhận hành động quan trọng (ẩn tin, huỷ đơn, duyệt báo cáo) |
| `ModulePlaceholder` | `src/components/ui/ModulePlaceholder.tsx` | Khung giữ chỗ cho các route đang phát triển |

---

## 2. Ví dụ sử dụng nhanh cho các thành viên

```tsx
import {
  Button,
  Input,
  Select,
  Textarea,
  StatusBadge,
  PriceText,
  Modal,
  ConfirmDialog,
} from "@/components/ui";
```

## 3. Quy ước
- Không chứa logic gọi API trực tiếp bên trong `src/components/ui/`.
- Mọi component đều nhận prop `className` để tuỳ biến bố cục.
- Sử dụng bảng màu chuẩn từ `src/app/globals.css` (Indigo cho hành động chính, Violet cho trao đổi thiết bị, Emerald/Amber/Rose cho trạng thái).
