# Feature: Catalog (Category / Brand) — **TV2**

Base project, schema DB, dữ liệu mẫu và API danh mục / thương hiệu.

## Phạm vi
- Prisma schema (8 model) + seed dữ liệu mẫu
- Prisma Client singleton, constants, state machine, format API
- API đọc danh mục & thương hiệu
- Upload ảnh (sẽ bổ sung — dùng local `/public/uploads`, không dùng cloud)

## API
| Method | Route | Mô tả |
|---|---|---|
| GET | `/api/categories` | Danh sách danh mục + `listingCount` |
| GET | `/api/brands` | Danh sách thương hiệu + `listingCount` |

## Model liên quan
`Category`, `Brand`

## Lưu ý
- File trong `src/lib/` là **dùng chung** — mọi người import, không sửa.
- Đổi schema → chỉ TV2 làm.
