# Feature: Khám phá, Tìm kiếm & Lọc — **TV4**

**Mũ 1:** UI/UX Lead (Navbar, Footer, theme, bộ component UI dùng chung)

## Phạm vi
- Trang chủ: danh sách tin nổi bật
- Trang danh sách: tìm theo từ khoá, lọc theo danh mục / thương hiệu /
  tình trạng / khoảng giá, sắp xếp, phân trang
- Trang chi tiết tin đăng
- **Bộ UI kit dùng chung** trong `src/components/ui/`

## Truy vấn dữ liệu
TV4 **không tạo route `/api/listings`** (thuộc TV3). Đọc dữ liệu bằng
Server Component + Prisma trong `src/features/discovery/queries.ts`.
Nếu cần lọc phía client mới, được tạo `/api/catalog/**` (đọc, không ghi).

## Model liên quan
`Listing`, `Category`, `Brand`, `User`

## Luật hiển thị
- Chỉ hiện tin `status === "ACTIVE"` (dùng `isListingPubliclyVisible`).
- Không hiện tin `PENDING`, `HIDDEN`, `REJECTED`.

## File được sửa
`src/features/discovery/**`, `src/components/layout/**`,
`src/components/ui/**`, `src/app/page.tsx`, `src/app/listings/**`,
`src/app/layout.tsx`, `src/app/globals.css`

## Lưu ý
`src/app/page.tsx` hiện là trang tạm của TV2 → **TV4 thay thế** bằng trang chủ thật.
