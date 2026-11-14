# Feature: Báo cáo vi phạm — **TV8**

## Phạm vi
- Người dùng bấm "Báo cáo tin đăng" trên trang chi tiết
- Chọn lý do + mô tả
- Admin xem danh sách và xử lý: `RESOLVED` (có hiệu lực) / `DISMISSED` (bỏ qua)
- Ghi `adminNote` khi xử lý

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/reports` | Gửi báo cáo |
| GET | `/api/reports?status=PENDING` | Admin xem danh sách |
| PATCH | `/api/reports/[id]` | Cập nhật trạng thái + `adminNote` |

## Model liên quan
`Report`, `Listing`, `User`

## Luật
- Một user không báo cáo tin của chính mình.
- Không gửi trùng báo cáo `PENDING` trên cùng listing.
- Chỉ `ADMIN` xử lý báo cáo.
- Xử lý `RESOLVED` có thể kèm ẩn tin (`Listing.status = HIDDEN`) —
  ghi rõ trong SRS của TV8.

## File được sửa
`src/features/report/**`, `src/app/api/reports/**`, `src/app/admin/reports/**`
