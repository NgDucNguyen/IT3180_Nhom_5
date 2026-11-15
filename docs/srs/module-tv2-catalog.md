# SRS — Module Base Setup & Danh mục (TV2)

**Phiên bản:** 1.0 · **Ngày:** Sprint 1 · **Người viết:** TV2 (System / DB Architect)

---

## 1. MỤC TIÊU

Cung cấp nền tảng kỹ thuật dùng chung cho 8 thành viên (khung dự án, schema CSDL,
dữ liệu mẫu, quy ước API, state machine) và cung cấp dữ liệu **Danh mục** /
**Thương hiệu** cho toàn bộ hệ thống.

Module này **không có giao diện người dùng riêng** ở thời điểm hiện tại — dữ liệu
được hiển thị trong module Khám phá (TV4) và form Đăng tin (TV3).

---

## 2. ACTOR LIÊN QUAN

| Actor | Tương tác |
|---|---|
| Guest | Xem danh mục/thương hiệu qua bộ lọc tìm kiếm |
| Registered User | Chọn danh mục/thương hiệu khi tạo tin |
| Admin | (Sprint sau) thêm/sửa danh mục, thương hiệu |
| Developer (8 TV) | Dùng schema, constants, state machine, format API |

---

## 3. USE CASE

### UC-CAT-01 — Lấy danh sách danh mục

- **Actor:** Guest, User, Admin
- **Tiền điều kiện:** DB đã được `db push` + `db seed`
- **Luồng chính:**
  1. Client gọi `GET /api/categories`
  2. Hệ thống truy vấn bảng `categories`, đếm số tin đăng mỗi danh mục
  3. Trả về `{ data: [{ id, name, slug, description, icon, listingCount }] }`
- **Luồng ngoại lệ:**
  - E1: Lỗi kết nối CSDL → `500 { error: { code: "INTERNAL_ERROR" } }`
  - E2: Danh sách rỗng → `200 { data: [] }` (không coi là lỗi)
- **Hậu điều kiện:** Không thay đổi dữ liệu

### UC-CAT-02 — Lấy danh sách thương hiệu

- **Actor:** Guest, User, Admin
- **Luồng chính:** `GET /api/brands` → `{ data: [{ id, name, slug, logoUrl, listingCount }] }`
- **Luồng ngoại lệ:** như UC-CAT-01

### UC-CAT-03 — Quy tắc chuyển trạng thái dùng chung

- **Actor:** Backend của TV3, TV5, TV6, TV7, TV8
- **Luồng chính:**
  1. Service lấy trạng thái hiện tại của entity
  2. Gọi `canTransitionX(from, to)` trong `src/lib/listing-state.ts`
  3. Nếu hợp lệ → cập nhật DB; nếu không → ném lỗi
- **Luồng ngoại lệ:** Chuyển trạng thái sai → `400 VALIDATION_ERROR`

---

## 4. YÊU CẦU CHỨC NĂNG

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-2.01 | Hệ thống có đủ 8 bảng: User, Category, Brand, Listing, PurchaseRequest, ExchangeOffer, Transaction, Report | Bắt buộc |
| FR-2.02 | `GET /api/categories` trả danh mục + số tin đăng | Bắt buộc |
| FR-2.03 | `GET /api/brands` trả thương hiệu + số tin đăng | Bắt buộc |
| FR-2.04 | Dữ liệu mẫu: 1 Admin, 3 User, 5 danh mục, 6 thương hiệu, 11 tin đăng | Bắt buộc |
| FR-2.05 | Seed idempotent (chạy nhiều lần không nhân đôi dữ liệu) | Bắt buộc |
| FR-2.06 | Cung cấp hàm kiểm tra chuyển trạng thái cho Listing/Transaction | Bắt buộc |
| FR-2.07 | Cung cấp format response chuẩn `{ data }` / `{ error }` | Bắt buộc |
| FR-2.08 | Upload ảnh lên local (`/public/uploads`) | Nên có (Sprint 2) |

---

## 5. YÊU CẦU PHI CHỨC NĂNG

| Mã | Yêu cầu |
|---|---|
| NFR-2.01 | Toàn bộ chạy trên máy local, không cần cài DB server (SQLite) |
| NFR-2.02 | `npm install → prisma db push → db seed → npm run dev` là đủ để chạy |
| NFR-2.03 | Thời gian phản hồi `/api/categories` < 200ms với 100 danh mục |
| NFR-2.04 | TypeScript strict, không `any` |
| NFR-2.05 | Không lộ `passwordHash` ra bất kỳ API nào |

---

## 6. RÀNG BUỘC DỮ LIỆU & TRẠNG THÁI

- SQLite **không hỗ trợ enum** → trạng thái là `String`, giá trị hợp lệ tập trung
  tại `src/lib/constants.ts`.
- Tiền là `Int` (VND).
- `specsJson` / `imagesJson` là chuỗi JSON.
- Bảng trạng thái chi tiết: xem `docs/diagrams/erd.md` mục 4.

---

## 7. TIÊU CHÍ CHẤP NHẬN

- [ ] `npx prisma db push` tạo đủ 8 bảng, không lỗi
- [ ] `npx prisma db seed` chạy 2 lần liên tiếp vẫn ra đúng 4 user / 5 danh mục /
      6 thương hiệu / 11 tin đăng
- [ ] `GET /api/categories` trả 200 kèm `listingCount` đúng
- [ ] `GET /api/brands` trả 200 kèm `listingCount` đúng
- [ ] `npm run check` xanh (typecheck + 9 test state machine)
- [ ] Post `POST /api/categories` trả 405 (không cho ghi)
- [ ] `docs/diagrams/erd.md` khớp 100% với `schema.prisma`

---

## 8. TRUY VẾT

| Yêu cầu | File hiện thực | Test |
|---|---|---|
| FR-2.01 | `prisma/schema.prisma` | `docs/diagrams/erd.md`, `docs/diagrams/architecture.md` |
| FR-2.02 | `src/features/catalog/queries.ts`, `src/app/api/categories/route.ts` | `tests/api-catalog.test.ts` |
| FR-2.03 | `src/features/catalog/queries.ts`, `src/app/api/brands/route.ts` | `tests/api-catalog.test.ts` |
| FR-2.04 | `prisma/seed.ts` | `tests/api-catalog.test.ts` |
| FR-2.06 | `src/lib/listing-state.ts`, `src/lib/constants.ts` | `tests/listing-state.test.ts` |
| FR-2.07 | `src/lib/api-response.ts` | `tests/api-catalog.test.ts` |
