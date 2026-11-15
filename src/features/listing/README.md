# Feature: Đăng tin & Quản lý tin bán — TV3 Sprint 1

**Mũ 1:** BA Lead. Đặc tả và truy vết:
[module-tv3-listing.md](../../../docs/srs/module-tv3-listing.md).

## Chức năng đã triển khai

- `/listings/create`: Form tạo tin, danh mục/hãng từ API TV2, giá VND, tình trạng,
  năm thông số kỹ thuật, đường dẫn ảnh, tùy chọn nhận trao đổi và ghi chú.
- `/seller/listings`: Tin cá nhân đủ bảy trạng thái, lọc, phân trang, modal sửa và
  xác nhận ẩn/bỏ ẩn. `/my-listings` sử dụng alias có sẵn của trang này.
- Trang là Server Components; xác thực và truy vấn ở server. Client Components
  chỉ xử lý form/modal và gọi API, không gọi Prisma.
- Ảnh dùng URL http/https hoặc đường dẫn nội bộ; không có upload mới.

## API và tích hợp

| Method | Route | Kết quả |
|---|---|---|
| POST | `/api/listings` | 201, tin mới PENDING thuộc user từ phiên |
| GET | `/api/listings?mine=true` | `{ items, page, limit, total }` |
| PATCH | `/api/listings/[id]` | Cập nhật từng phần nội dung của chủ tin |
| PATCH | `/api/listings/[id]/hide` | ACTIVE ↔ HIDDEN, không cần body |

GET hỗ trợ `status`, `page=1`, `limit=20` (tối đa 100). Nếu truyền `sellerId`, giá trị
phải trùng phiên. Không có demo-user bypass; mọi API cần cookie JWT của TV1.
Response theo helper TV2 và `Cache-Control: no-store`. Các thao tác ghi kiểm tra
same-origin bằng helper TV1. UI quản lý gọi cùng service phía server với GET API.

`validation.ts` chuẩn hóa và whitelist trường nội dung trước khi gọi `service.ts`.
Category/Brand được kiểm tra tồn tại; specs là chuỗi JSON object giá trị đơn;
images là chuỗi JSON mảng URL. Client không được gán sellerId, status hoặc id.

## Quy tắc trạng thái

- Tạo tin luôn PENDING. Chỉ chủ tin được sửa/ẩn; quyền Admin không bỏ qua ownership.
- `isListingEditable` chặn sửa IN_TRANSACTION/SOLD/EXCHANGED.
- Sửa nội dung ACTIVE → PENDING; REJECTED → PENDING để duyệt lại.
- Giữ PENDING/HIDDEN khi sửa theo checklist; lưu không đổi nội dung ACTIVE giữ ACTIVE.
- `assertListingTransition` kiểm tra REJECTED → PENDING và ACTIVE ↔ HIDDEN.
- Cập nhật trong Prisma transaction, điều kiện id/sellerId/status/updatedAt cũ để
  không ghi đè thay đổi đồng thời. Luôn dùng singleton và select tường minh.

Helper TV2 hiện thiếu cạnh ACTIVE → PENDING. Quy tắc duyệt lại được thực hiện tại
service TV3 sau guard editable; không sửa helper dùng chung. Chính sách duyệt lại
nội dung HIDDEN cần TV2/PM thống nhất trước khi mở rộng, như đã ghi trong SRS.
Không bổ sung DELETE, API chi tiết riêng hoặc API kiểm duyệt trong task này.

## Kiểm chứng và chạy lại

Với môi trường local đã cài dependencies, sinh Prisma Client và seed DB theo hướng
dẫn gốc, chạy:

```bash
npm run check
npm run build
npm run dev -- --hostname 127.0.0.1 --port 3180
```

`tests/listing.test.ts` có 70 test tích hợp dùng SQLite thật: tạo/validate, auth và
ownership, tham chiếu catalog, lọc/phân trang, sửa/duyệt lại, ẩn/bỏ ẩn. Test chỉ tạo
và dọn fixture của chính mình, không sửa seed hay test của thành viên khác.

Kiểm tra giao diện tùy chọn, không thêm dependency vào dự án:

```bash
node --import tsx src/features/listing/browser-check.mjs
```

Cần driver Playwright có sẵn bên ngoài repo: đặt `PLAYWRIGHT_MODULE` tới module
hoặc file URL của driver và `CHROME_PATH` tới Chrome/Edge. `DATABASE_URL` phải cùng
DB với dev server; server cần `JWT_SECRET` từ cấu hình local. Có thể đổi địa chỉ
bằng `LISTING_BASE_URL` và thư mục ảnh bằng `LISTING_EVIDENCE_DIR`.
Script đăng ký tài khoản kiểm thử rồi dọn tài khoản/tin của nó trong finally.
Vì TV8 chưa có API duyệt, script chỉ cập nhật fixture trong DB để kiểm tra UI ACTIVE.

Kết quả bàn giao: `npm run check` — 138/138 test pass, gồm 70 TV3;
`npm run build` pass; browser-check pass, không lỗi JavaScript/hydration hoặc tràn
ngang ở 390px. Bốn ảnh nằm trong [evidence/](evidence/).
Validation được chạy bằng Node portable và SQLite tạm trong thư mục TEMP;
không tạo/sửa `.env`, schema hoặc package manifests.

Nhánh: `feat/tv3-listing-sprint1`. Repository chưa có `develop`; cần PM/TV2 tạo hoặc
chốt nhánh tích hợp và thành viên khác review trước khi merge. Không tự merge main.
