# Feature: Admin Dashboard — **TV8**

**Mũ 1:** QA / Test Lead (chủ trì test plan, bug log, kịch bản demo)

## Phạm vi
- Duyệt / từ chối tin đăng mới (`PENDING` → `ACTIVE` / `REJECTED`)
- Khoá / mở khoá tài khoản (`User.status` `ACTIVE` ↔ `LOCKED`)
- Quản lý danh mục & thương hiệu (thêm/sửa)
- Xem thống kê cơ bản

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| GET | `/api/admin/listings?status=PENDING` | Danh sách chờ duyệt |
| PATCH | `/api/admin/listings/[id]/approve` | Duyệt |
| PATCH | `/api/admin/listings/[id]/reject` | Từ chối |
| GET | `/api/admin/users` | Danh sách user |
| PATCH | `/api/admin/users/[id]/status` | Khoá / mở khoá |
| POST | `/api/admin/categories` | Thêm danh mục |
| POST | `/api/admin/brands` | Thêm thương hiệu |

## Model liên quan
`Listing`, `User`, `Report`, `Category`, `Brand`

## Luật
- **Mọi route phải kiểm tra `role === "ADMIN"` ở phía server.**
  Ẩn nút ở UI là không đủ.
- Duyệt tin: dùng `assertListingTransition(PENDING, ACTIVE)`.
- Không xoá cứng user/tin đã có giao dịch.

## File được sửa
`src/features/admin/**`, `src/app/api/admin/**`, `src/app/admin/**`,
`tests/README.md`, `docs/srs/test-plan.md`
