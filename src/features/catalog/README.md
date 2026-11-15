# Feature: Catalog (Category / Brand) — **TV2**

Base project, schema DB, dữ liệu mẫu và API danh mục / thương hiệu.

## Phạm vi
- Prisma schema (8 model) + seed dữ liệu mẫu
- Prisma Client singleton, constants, state machine, format API
- API đọc danh mục & thương hiệu
- Upload ảnh (sẽ bổ sung — dùng local `/public/uploads`, không dùng cloud)

## API & Service
| Thành phần | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/categories` | Danh sách danh mục + `listingCount` (sắp xếp tiếng Việt) |
| GET | `/api/brands` | Danh sách thương hiệu + `listingCount` (sắp xếp tiếng Việt) |
| Service | `src/features/catalog/queries.ts` | `getCatalogCategories`, `getCategoryBySlug`, `getCatalogBrands`, `getBrandBySlug` |

## Model liên quan
`Category`, `Brand`

## Lưu ý
- File trong `src/lib/` là **dùng chung** — mọi người import, không sửa.
- Đổi schema → chỉ TV2 làm.
