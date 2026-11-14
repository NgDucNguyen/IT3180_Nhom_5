# Feature: Đăng tin & Quản lý tin bán — **TV3**

**Mũ 1:** BA Lead (chủ trì SRS)

## Phạm vi
- Tạo tin đăng: tiêu đề, mô tả, giá, tình trạng, danh mục, thương hiệu,
  thông số kỹ thuật (`specsJson`), ảnh (`imagesJson`)
- Bật/tắt nhận trao đổi (`allowExchange`) + ghi chú mong muốn đổi
- Trang "Tin đăng của tôi": sửa, ẩn/hiện, xoá mềm
- Sửa tin đã duyệt → **bắt buộc quay về `PENDING`** để Admin duyệt lại

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/listings` | Tạo tin (status `PENDING`) |
| GET | `/api/listings?mine=true` | Tin của tôi |
| GET | `/api/listings/[id]` | Chi tiết (chủ tin hoặc Admin) |
| PATCH | `/api/listings/[id]` | Sửa tin |
| PATCH | `/api/listings/[id]/hide` | Ẩn / bỏ ẩn |
| DELETE | `/api/listings/[id]` | Xoá mềm (đưa về `HIDDEN`) |

## Model liên quan
`Listing`

## Luật nghiệp vụ
- Chỉ chủ tin (hoặc Admin) được sửa/ẩn.
- Tin đang `IN_TRANSACTION` / `SOLD` / `EXCHANGED` → **không được sửa**.
- Dùng `assertListingTransition()` từ `@/lib/listing-state`.
- Không tự đổi `status` sang `ACTIVE` — chỉ Admin (TV8) duyệt.

## File được sửa
`src/features/listing/**`, `src/app/api/listings/**`, `src/app/my-listings/**`,
`docs/srs/**`
