# CẨM NANG HƯỚNG DẪN THỰC HIỆN DỰ ÁN CHO 8 THÀNH VIÊN & AI AGENT
**Dự án:** Electronics Trading & Exchange Marketplace (Sàn C2C Mua bán & Trao đổi Thiết bị Điện tử — **ElectroSwap C2C**)  
**Học phần:** Nhập môn Công nghệ phần mềm (IT3180) — **Nhóm 5**

> **Cách sử dụng file này:**  
> Mỗi thành viên (từ **TV1 đến TV8**) khi mở AI Agent (Antigravity, Cursor, Copilot, Claude Code...) chỉ cần nói:  
> *"Hãy đọc `AGENTS.md` và phần của **TV[x]** trong `MEMBER-AI-PLAYBOOK.md` rồi thực hiện nhiệm vụ Sprint [y] cho tôi."*

---

## PHẦN I — LUẬT BẮT BUỘC CHO AI AGENT TRƯỚC KHI VIẾT BẤT KỲ DÒNG CODE NÀO

### 1. Kiểm tra Nhánh Git (Branch Check) — TUYỆT ĐỐI KHÔNG CODE TRÊN `main`
Trước khi sửa bất kỳ file nào, AI Agent của thành viên **bắt buộc** phải chạy lệnh kiểm tra nhánh hiện tại:

```bash
git status
git branch --show-current
```

- **Quy tắc sống còn:**
  - Nhánh `main`: Nhánh ổn định chỉ dùng để Demo với giảng viên. **CẤM push trực tiếp lên `main` dưới mọi hình thức.**
  - Nhánh `develop`: Nhánh tích hợp code của 8 thành viên. **Không code trực tiếp trên `develop`.**
  - Nhánh cá nhân: Mỗi thành viên **phải tạo nhánh riêng** từ `develop` theo cú pháp `feat/tv<Số>-<tên-ngắn-gọn>`:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b feat/tv1-auth-profile
    ```
  - Khi làm xong: Push nhánh cá nhân lên GitHub (`git push -u origin feat/tvX-...`) và tạo **Pull Request (PR)** gộp vào `develop`. Phải có ít nhất **1 thành viên khác Review & Approve** trước khi Merge.

### 2. Kiểm tra Môi trường Local & Cơ sở dữ liệu
Dự án chạy **100% trên máy local** với SQLite (không cần cài DB server ngoài):

```bash
npm install               # 1. Cài đặt dependencies
npx prisma db push        # 2. Đồng bộ schema tạo file prisma/dev.db
npx prisma db seed        # 3. Nạp dữ liệu mẫu (5 danh mục, 6 hãng, 4 user, 11 tin đăng)
npm run dev               # 4. Chạy dev server tại http://localhost:3000
npm run check             # 5. Chạy TypeScript typecheck + Vitest (BẮT BUỘC xanh trước khi commit)
```

### 3. Tech Stack & Quy ước Kiến trúc (CẤM TỰ Ý THAY ĐỔI)

| Thành phần | Công nghệ bắt buộc | Quy tắc bắt buộc cho AI Agent |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Mặc định dùng Server Component; chỉ thêm `"use client"` ở component có state/sự kiện tương tác. |
| **Ngôn ngữ** | **TypeScript (`strict: true`)** | **Cấm tuyệt đối `any`**, `@ts-ignore`, `console.log` bỏ quên. |
| **Giao diện (UI)** | **Tailwind CSS v4** | Tái sử dụng bộ UI dùng chung tại `src/components/ui/` và `src/components/layout/`. **Cấm tự cài thêm thư viện UI ngoài** (MUI, Antd, Chakra...). |
| **ORM & DB** | **Prisma 6 + SQLite** | Luôn `import { prisma } from "@/lib/prisma"`. **Cấm `new PrismaClient()`** ở file khác. Luôn dùng `select` tường minh, **cấm trả `passwordHash`**. |
| **Xác thực** | **JWT (`httpOnly` cookie)** + `bcryptjs` (cost 10) | **Cấm lưu JWT vào `localStorage` hoặc `sessionStorage`.** |
| **State Machine** | `src/lib/constants.ts` & `src/lib/listing-state.ts` | Không hardcode chuỗi trạng thái. Luôn gọi `canTransitionListing`, `assertListingTransition`, `canTransitionPurchaseRequest`, `canTransitionExchangeOffer`, `canTransitionTransaction`. |
| **Format API** | `src/lib/api-response.ts` | Mọi API trả về `{ data: ... }` hoặc `{ error: { code, message } }` thông qua helper `ok()`, `fail()`, `handleApiError()`, `getPagination()`. |
| **Kiểm thử** | **Vitest** (`tests/*.test.ts`) | Mỗi thành viên tự tạo file `tests/<module>.test.ts` riêng, không sửa file test của người khác. |

### 4. Quy tắc Commit để cả 8 thành viên đều có biểu đồ đóng góp GitHub rõ ràng
Chia nhỏ công việc thành **tối thiểu 3 commit có ý nghĩa** trong mỗi Sprint:
1. Commit tài liệu CNPM / SRS / Sơ đồ Mermaid: `docs(srs): đặc tả use case và sơ đồ <module> [TVx]`
2. Commit Backend API & Logic nghiệp vụ: `feat(<module>): xây dựng API <mô-tả> [TVx]`
3. Commit Frontend UI & Kiểm thử Vitest: `feat(<module>): hoàn thiện giao diện và test <mô-tả> [TVx]`

---

## PHẦN II — LỘ TRÌNH 5 SPRINT & ĐẦU RA CỦA TỪNG THÀNH VIÊN QUA CÁC SPRINT

Dựa trên kế hoạch `agileplan.tsv` và mô hình **"Mũ kép" (1 Vai trò CNPM + 1 Phân hệ Code dọc)** trong `GUIDE.md`, dự án gồm 5 Sprint:

### Tổng quan mục tiêu 5 Sprint

| Sprint | Chủ đề trọng tâm (theo `agileplan.tsv`) | Mục tiêu Demo cuối Sprint |
|---|---|---|
| **Sprint 1** | **Nền tảng, Design System & Luồng cốt lõi (WBS 1.1 – 1.10)** | Chốt SRS khung, State Machine, ERD, Schema + Seed DB, Khung UI chung (Navbar/Footer/ListingCard/StatusBadge), Đăng ký/Đăng nhập, Tạo tin đăng và Khám phá/Tìm kiếm sản phẩm. |
| **Sprint 2** | **Tìm kiếm nâng cao & Quy trình Mua hàng (WBS 2.1 – 2.7)** | Quản lý tin bán (sửa/ẩn tin), Người mua gửi `PurchaseRequest`, Người bán Chấp nhận/Từ chối sinh `Transaction`, khóa `Listing` (`IN_TRANSACTION`) và xác nhận hoàn tất mua bán (`SOLD`). |
| **Sprint 3** | **Quy trình Đề nghị & Giao dịch Trao đổi thiết bị (WBS 3.1 – 3.2)** | Người dùng chọn thiết bị Y của mình đề nghị đổi lấy thiết bị X (`ExchangeOffer` + `cashTopUp`), chủ tin X chấp nhận/từ chối, khóa đồng thời 2 thiết bị và hoàn tất trao đổi (`EXCHANGED`). |
| **Sprint 4** | **Quản trị nền tảng, Kiểm duyệt & Báo cáo vi phạm (WBS 4.1 – 4.2)** | Người dùng gửi `Report` vi phạm; Admin duyệt/từ chối tin đăng `PENDING`, xử lý `Report` (`RESOLVED`/`DISMISSED`), khóa/mở khóa tài khoản User. |
| **Sprint 5** | **Kiểm thử tích hợp, Hoàn thiện tài liệu & Demo cuối kỳ (WBS 5.1 – 5.2)** | Chạy trọn bộ E2E/Integration Test cho cả 3 luồng (Đăng bán – Mua hàng – Trao đổi – Admin), đóng gói SRS hoàn chỉnh, slide báo cáo và kịch bản Demo. |

---

### Bảng phân rã Đầu ra (Deliverables) của 8 Thành viên từ Sprint 1 đến Sprint 5

| Thành viên | Đầu ra Sprint 1 | Đầu ra Sprint 2 | Đầu ra Sprint 3 | Đầu ra Sprint 4 | Đầu ra Sprint 5 |
|---|---|---|---|---|---|
| **TV1**<br>*(PM & Auth/Profile)* | • Tài liệu phạm vi MVP & User Stories (`docs/srs/overview.md`, `docs/srs/module-tv1-auth.md`)<br>• API `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`<br>• UI `/login`, `/register` & helper `src/lib/auth.ts`<br>• Test `tests/auth.test.ts` | • UI & API xem/cập nhật Hồ sơ cá nhân (`/profile`, `PATCH /api/profile`)<br>• Middleware bảo vệ các route cần đăng nhập (`src/middleware.ts`) | • Hiển thị thống kê cá nhân trên trang `/profile` (số tin đang bán, số giao dịch mua/trao đổi)<br>• Điều phối tiến độ Sprint 3 | • Hoàn thiện guard phân quyền `role === "ADMIN"` phối hợp với TV8<br>• Kiểm thử bảo mật cookie & phân quyền | • Tổng hợp báo cáo cuối kỳ, ghép Slide thuyết trình nhóm, rà soát GitHub Projects Board |
| **TV2**<br>*(Architect & Catalog)* | • `prisma/schema.prisma` (8 bảng), `prisma/seed.ts`, `src/lib/*` (`prisma.ts`, `constants.ts`, `listing-state.ts`, `api-response.ts`)<br>• API `GET /api/categories`, `GET /api/brands`<br>• Tài liệu `docs/diagrams/erd.md`, `docs/srs/module-tv2-catalog.md`<br>• Test `tests/listing-state.test.ts`, `tests/api-catalog.test.ts` | • Hỗ trợ helper/API upload hoặc chọn hình ảnh thiết bị (`src/features/catalog/`)<br>• Review PR đảm bảo các thành viên dùng đúng Prisma singleton | • Kiểm tra tính toàn vẹn khoá ngoại và transaction DB cho luồng trao đổi 2 thiết bị | • Hỗ trợ query/service quản lý Category & Brand cho Admin | • Kiểm tra hiệu năng DB, chốt script `npm run db:reset` chuẩn bị dữ liệu Demo cuối kỳ |
| **TV3**<br>*(BA Lead & Seller Listing)* | • Khung tài liệu SRS & `docs/srs/module-tv3-listing.md`<br>• API `POST /api/listings` (tạo tin mới), `GET /api/listings?mine=true`<br>• UI trang tạo tin `/listings/create`<br>• Test `tests/listing.test.ts` | • UI & API Quản lý tin của tôi (`/seller/listings`, `/my-listings`)<br>• API `PATCH /api/listings/[id]` (sửa tin `ACTIVE` tự động về `PENDING`), `PATCH /api/listings/[id]/hide` (ẩn/bỏ ẩn tin) | • Cung cấp danh sách thiết bị `ACTIVE` của người dùng hiện tại để TV7 nạp vào bộ chọn đổi máy (`offeredListingId`) | • Hiển thị lý do bị từ chối duyệt và luồng gửi duyệt lại (`REJECTED -> PENDING`) | • Tổng hợp và chuẩn hoá toàn bộ thư mục `docs/srs/` của cả 8 thành viên |
| **TV4**<br>*(UI/UX Lead & Discovery)* | • Design System (`globals.css`), Shared Layout (`Navbar`, `Footer`, `Container`), UI Kit (`ListingCard`, `StatusBadge`, `PriceText`, `Button`, `EmptyState`, `Pagination`)<br>• Trang khung cho TV1,3,5,6,7,8<br>• Trang chủ (`/`), Trang Khám phá & Lọc (`/listings`), Trang Chi tiết (`/listings/[id]`) kèm 3 Action Slots<br>• Tài liệu `docs/srs/tv4-ui-and-discovery.md` & `tests/discovery.test.ts` | • Tinh chỉnh UX bộ lọc đa tiêu chí, đồng bộ trạng thái đăng nhập thực tế từ `/api/auth/me` của TV1 lên `Navbar` | • Hỗ trợ nhúng component Đề nghị trao đổi của TV7 vào Action Slot 2 trên `/listings/[id]` | • Hỗ trợ nhúng Modal Báo cáo vi phạm của TV8 vào Action Slot 3 trên `/listings/[id]` | • Rà soát tính nhất quán UI/UX và Responsive toàn sàn trước ngày Demo |
| **TV5**<br>*(Workflow Mua & Buyer Request)* | • Tài liệu `docs/srs/module-tv5-purchase.md` (State Machine & Sequence Diagram luồng Mua hàng)<br>• Khung service validate điều kiện gửi yêu cầu mua (`src/features/purchase/`) & unit test quy tắc mua hàng `tests/purchase.test.ts` | • API `POST /api/purchase-requests`, `GET /api/purchase-requests?mine=true`, `PATCH /api/purchase-requests/[id]/cancel`<br>• Gắn nút & Modal "Gửi yêu cầu mua" vào Action Slot 1 trên `/listings/[id]`<br>• Hoàn thiện trang `/buyer/requests` | • Bổ sung bộ lọc theo trạng thái (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`) trên trang `/buyer/requests` | • Kiểm thử các trường hợp biên (chặn tự mua tin của mình, chặn gửi trùng yêu cầu `PENDING`) | • Phối hợp kiểm thử tích hợp luồng Người mua – Người bán (TV5 ↔ TV6) |
| **TV6**<br>*(Workflow Giao dịch & Transaction)* | • Tài liệu `docs/srs/module-tv6-transaction.md` (Activity Diagram & quy tắc khóa sản phẩm chống double-booking)<br>• Khung service kiểm tra điều kiện giao dịch (`src/features/transaction/`) & unit test `tests/transaction.test.ts` | • API `POST /api/purchase-requests/[id]/accept`, `POST /api/purchase-requests/[id]/reject`<br>• API `GET /api/transactions`, `PATCH /api/transactions/[id]/confirm`, `PATCH /api/transactions/[id]/cancel`<br>• Hoàn thiện trang `/transactions` | • Mở rộng xử lý `Transaction` cho `type = "EXCHANGE"` (khi hoàn tất cập nhật cả 2 `Listing` sang `EXCHANGED`; khi hủy trả cả 2 về `ACTIVE`) | • Bổ sung giao diện lịch sử giao dịch chi tiết theo vai trò Người mua / Người bán | • Kiểm thử chống double-booking (2 người cùng được chấp nhận trên 1 thiết bị) |
| **TV7**<br>*(BA/Designer Trao đổi & ExchangeOffer)* | • Tài liệu `docs/srs/module-tv7-exchange.md` (Đặc tả nghiệp vụ & Sequence Diagram luồng Trao đổi thiết bị Y ↔ X)<br>• Khung validate điều kiện trao đổi (`src/features/exchange/`) & unit test `tests/exchange.test.ts` | • Xây dựng UI danh sách quản lý đề nghị trao đổi đã gửi/đã nhận tại `/exchanges` | • API `POST /api/exchange-offers`, `GET /api/exchange-offers`, `PATCH /api/exchange-offers/[id]/accept`, `reject`, `cancel`<br>• Gắn Modal "Đề nghị trao đổi thiết bị" vào Action Slot 2 trên `/listings/[id]` | • Kiểm thử khóa đồng thời 2 thiết bị trong `prisma.$transaction` khi chấp nhận trao đổi | • Chuẩn bị kịch bản Demo luồng Trao đổi thiết bị có bù tiền (`cashTopUp`) |
| **TV8**<br>*(QA/Test Lead & Admin/Report)* | • Tài liệu `docs/srs/test-plan.md` & `docs/srs/module-tv8-admin-report.md`<br>• Thiết kế ma trận kiểm thử (Test Matrix) cho toàn bộ quy tắc nghiệp vụ & `tests/admin-report.test.ts` | • API `POST /api/reports` & gắn Modal "Báo cáo tin vi phạm" vào Action Slot 3 trên `/listings/[id]` | • Xây dựng API kiểm duyệt tin đăng: `GET /api/admin/listings`, `PATCH /api/admin/listings/[id]/approve` & `reject` | • Hoàn thiện Admin Dashboard (`/admin`): duyệt tin `PENDING`, xử lý `Report` (`RESOLVED`/`DISMISSED`), khóa/mở khóa tài khoản User (`/api/admin/users/[id]/status`) | • Chủ trì chạy toàn bộ Test Suite, lập Báo cáo Kiểm thử & Kịch bản Demo cuối kỳ |

---

## PHẦN III — NHIỆM VỤ CHI TIẾT & PROMPT CHO TỪNG THÀNH VIÊN TRONG SPRINT 1

> **LƯU Ý QUAN TRỌNG:**  
> Hiện tại **TV2** (Schema, Seed, Constants, State Machine) và **TV4** (Design System, Navbar, Footer, ListingCard, StatusBadge, Trang chủ, Trang Khám phá, Trang Chi tiết sản phẩm và các Trang khung Placeholder) **đã hoàn thành xong nền tảng Sprint 1**.  
> Dưới đây là hướng dẫn chi tiết cho từng thành viên trong Sprint 1.

---

### 👤 THÀNH VIÊN 1 (TV1) — PM / Scrum Master & Module Auth + Hồ sơ cá nhân

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/auth/**`
- `src/app/api/auth/**`
- `src/app/(auth)/**` (TV4 đã tạo sẵn khung tại `src/app/(auth)/login/page.tsx` và `src/app/(auth)/register/page.tsx`)
- `src/app/profile/**` (TV4 đã tạo sẵn khung tại `src/app/profile/page.tsx`)
- `src/lib/auth.ts`, `src/middleware.ts`
- `docs/srs/overview.md`, `docs/srs/module-tv1-auth.md`
- `tests/auth.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv1-auth-sprint1`
2. **Mũ 1 (PM / Tài liệu CNPM):**
   - Tạo `docs/srs/overview.md`: Mô tả tổng quan hệ thống ElectroSwap C2C, danh sách Actor (Guest, Registered User, Admin), sơ đồ Use Case tổng thể bằng Mermaid và phạm vi In-Scope / Out-of-Scope.
   - Tạo `docs/srs/module-tv1-auth.md`: Đặc tả chi tiết các Use Case Đăng ký (`UC-AUTH-01`), Đăng nhập (`UC-AUTH-02`), Đăng xuất (`UC-AUTH-03`), Xem & Cập nhật hồ sơ (`UC-AUTH-04`) kèm luồng ngoại lệ (email trùng, mật khẩu yếu, tài khoản `LOCKED`).
3. **Mũ 2 (Code Module Auth):**
   - Xây dựng `src/lib/auth.ts`: Hàm tạo/xác thực JWT (dùng `crypto` HMAC-SHA256 của Node.js hoặc cookie session ký bằng `JWT_SECRET` trong `.env` — **lưu ý không tự cài thư viện mới nếu không cần thiết**), đọc user hiện tại từ `httpOnly` cookie, kiểm tra tài khoản `status === "ACTIVE"`.
   - Xây dựng các API Route chuẩn format `{ data }` / `{ error }` (dùng `ok`, `fail`, `handleApiError` từ `@/lib/api-response`):
     - `POST /api/auth/register`: Nhận `{ email, password, fullName, phone? }`, kiểm tra email chưa tồn tại, hash mật khẩu bằng `bcryptjs` (cost 10), tạo `User` với `role = "USER"`, `status = "ACTIVE"`, set `httpOnly` cookie và trả về thông tin user (không có `passwordHash`).
     - `POST /api/auth/login`: Nhận `{ email, password }`, kiểm tra mật khẩu bằng `bcryptjs.compare`, chặn đăng nhập nếu `user.status === "LOCKED"` (trả `403 FORBIDDEN`), set `httpOnly` cookie.
     - `POST /api/auth/logout`: Xoá cookie phiên đăng nhập.
     - `GET /api/auth/me`: Trả về thông tin user đang đăng nhập từ cookie (hoặc `401 UNAUTHENTICATED` nếu chưa đăng nhập).
   - Thay thế nội dung trang khung `src/app/(auth)/login/page.tsx` và `src/app/(auth)/register/page.tsx` bằng giao diện Form Đăng nhập / Đăng ký hoàn chỉnh (sử dụng `Button`, `Card`, `StatusBadge` từ `@/components/ui`), kèm bảng gợi ý nhanh 4 tài khoản demo (`admin@nhom5.vn`, `an@nhom5.vn`, `binh@nhom5.vn`, `chi@nhom5.vn` / mật khẩu `123456`).
4. **Kiểm thử (`tests/auth.test.ts`):**
   - Test đăng ký thành công, đăng ký trùng email trả `409 CONFLICT`, đăng nhập đúng mật khẩu trả `200`, đăng nhập sai mật khẩu trả `401 UNAUTHENTICATED`.

#### 3. Prompt mẫu cho AI của TV1
```text
Hãy đóng vai Thành viên 1 (PM / Scrum Master kiêm phụ trách Module Auth & Hồ sơ cá nhân).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma và phần TV1 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git hiện tại, nếu chưa ở nhánh feat/tv1-auth-sprint1 thì tạo nhánh mới.
2. Viết tài liệu docs/srs/overview.md và docs/srs/module-tv1-auth.md theo đúng mẫu trong docs/srs/README.md.
3. Xây dựng src/lib/auth.ts và các API: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me (dùng bcryptjs cost 10, httpOnly cookie, tuyệt đối không trả passwordHash, dùng ok/fail từ @/lib/api-response).
4. Hoàn thiện giao diện đăng nhập/đăng ký tại src/app/(auth)/login/page.tsx và src/app/(auth)/register/page.tsx sử dụng các component trong @/components/ui.
5. Viết test trong tests/auth.test.ts và chạy npm run check đảm bảo pass 100%.
```

---

### 👤 THÀNH VIÊN 2 (TV2) — System / DB Architect & Module Base Setup + Danh mục

#### 1. Phạm vi sở hữu file
- `prisma/schema.prisma`, `prisma/seed.ts`
- `src/lib/prisma.ts`, `src/lib/constants.ts`, `src/lib/listing-state.ts`, `src/lib/api-response.ts`
- `src/features/catalog/**`, `src/app/api/categories/**`, `src/app/api/brands/**`
- `docs/diagrams/**`, `docs/srs/module-tv2-catalog.md`, `AGENTS.md`
- `tests/listing-state.test.ts`, `tests/api-catalog.test.ts`

#### 2. Trạng thái & Nhiệm vụ trong Sprint 1
- **Trạng thái hiện tại:** Đã hoàn thành 100% các đầu mục nền tảng Sprint 1 (Schema 8 bảng, Seed idempotent, State Machine, API Categories/Brands, ERD và 13 unit/smoke tests).
- **Nhiệm vụ bổ sung trong Sprint 1 (nếu muốn tăng thêm commit hoặc hỗ trợ nhóm):**
  1. Tạo nhánh `feat/tv2-catalog-service` để bổ sung tầng service chuẩn trong `src/features/catalog/queries.ts` (hàm lấy chi tiết danh mục theo `slug`, lấy danh sách thương hiệu kèm số lượng tin theo từng trạng thái).
  2. Viết thêm sơ đồ kiến trúc tổng thể hệ thống (System Architecture Diagram bằng Mermaid) tại `docs/diagrams/architecture.md` mô tả luồng Client ↔ Next.js App Router (Server Components / Route Handlers) ↔ Prisma Singleton ↔ SQLite.
  3. Review và Approve các Pull Request của 7 thành viên còn lại khi gộp vào `develop`.

---

### 👤 THÀNH VIÊN 3 (TV3) — BA Lead & Module Đăng tin + Quản lý tin bán (Seller Listing)

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/listing/**`
- `src/app/api/listings/**`
- `src/app/listings/create/page.tsx` (TV4 đã dựng trang khung, TV3 vào thay bằng Form tạo tin thật)
- `src/app/seller/listings/**`, `src/app/my-listings/**`
- `docs/srs/module-tv3-listing.md`
- `tests/listing.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv3-listing-sprint1`
2. **Mũ 1 (BA Lead / Tài liệu CNPM):**
   - Tạo `docs/srs/module-tv3-listing.md`: Đặc tả chi tiết các Use Case Tạo tin đăng mới (`UC-LST-01`), Xem danh sách tin đăng của tôi (`UC-LST-02`), Chỉnh sửa tin đăng (`UC-LST-03` — lưu ý quy tắc sửa tin `ACTIVE` phải quay về `PENDING`), Ẩn/Bỏ ẩn tin đăng (`UC-LST-04`).
3. **Mũ 2 (Code Module Seller Listing):**
   - Xây dựng validation & service tại `src/features/listing/`:
     - Kiểm tra dữ liệu đầu vào khi tạo/sửa tin: `title` (5–120 ký tự), `description` (≥ 10 ký tự), `price` (số nguyên `> 0`), `condition` thuộc `CONDITION_VALUES`, `categoryId` tồn tại, `specsJson` và `imagesJson` là chuỗi JSON hợp lệ.
   - Xây dựng API tại `src/app/api/listings/route.ts`:
     - `POST /api/listings`: Tạo tin đăng mới với `status = LISTING_STATUS.PENDING` (hoặc nhận `sellerId` từ phiên đăng nhập / demo user khi test), trả về `201 Created` qua `ok(listing, 201)`.
     - `GET /api/listings?mine=true&sellerId=...`: Lấy danh sách tin đăng của người bán (bao gồm cả `PENDING`, `ACTIVE`, `IN_TRANSACTION`, `SOLD`, `EXCHANGED`, `HIDDEN`, `REJECTED`) để hiển thị trên trang quản lý cá nhân.
   - Xây dựng API tại `src/app/api/listings/[id]/route.ts` và `src/app/api/listings/[id]/hide/route.ts`:
     - `PATCH /api/listings/[id]`: Chỉ chủ tin được sửa; kiểm tra `isListingEditable(listing.status)` (chặn sửa nếu `IN_TRANSACTION`, `SOLD`, `EXCHANGED` → trả `409 CONFLICT`); nếu tin đang `ACTIVE` hoặc `REJECTED` khi sửa nội dung thì chuyển `status` về `PENDING`.
     - `PATCH /api/listings/[id]/hide`: Chuyển đổi `ACTIVE <-> HIDDEN` sử dụng `assertListingTransition`.
   - Hoàn thiện giao diện:
     - Trang `/listings/create` (`src/app/listings/create/page.tsx`): Form đăng tin bán thiết bị (chọn Category, Brand từ `/api/categories` và `/api/brands`, chọn Condition, nhập giá VNĐ, nhập thông số kỹ thuật Màn hình/CPU/RAM/Bộ nhớ/Pin, bật/tắt `allowExchange` và nhập `exchangePreference`).
     - Trang `/seller/listings` (`src/app/seller/listings/page.tsx`): Bảng/danh sách quản lý tin đăng của người bán kèm `<StatusBadge />`, nút Ẩn/Hiện tin.
4. **Kiểm thử (`tests/listing.test.ts`):**
   - Test tạo tin hợp lệ trả `201` với trạng thái `PENDING`; tạo tin với giá `<= 0` trả `400 VALIDATION_ERROR`; ẩn tin đang `SOLD` trả lỗi chuyển trạng thái.

#### 3. Prompt mẫu cho AI của TV3
```text
Hãy đóng vai Thành viên 3 (BA Lead kiêm phụ trách Module Đăng tin & Quản lý tin bán).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma, src/lib/listing-state.ts và phần TV3 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git, tạo nhánh feat/tv3-listing-sprint1 nếu chưa có.
2. Viết tài liệu đặc tả docs/srs/module-tv3-listing.md đầy đủ Use Case, luồng ngoại lệ và sơ đồ Mermaid.
3. Xây dựng logic trong src/features/listing/ và các API tại src/app/api/listings/ (POST tạo tin, GET tin của tôi, PATCH sửa tin, PATCH ẩn/bỏ ẩn tin). Tuân thủ chặt chẽ isListingEditable và assertListingTransition từ @/lib/listing-state.
4. Hoàn thiện giao diện tạo tin tại src/app/listings/create/page.tsx và trang quản lý tin tại src/app/seller/listings/page.tsx (tái sử dụng StatusBadge, PriceText, Button từ @/components/ui).
5. Viết test trong tests/listing.test.ts và chạy npm run check đảm bảo pass 100%.
```

---

### 👤 THÀNH VIÊN 4 (TV4) — UI/UX Lead & Module Khám phá, Tìm kiếm, Lọc (Discovery)

#### 1. Phạm vi sở hữu file
- `src/components/layout/**`, `src/components/ui/**`
- `src/features/discovery/**`
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/listings/page.tsx`, `src/app/listings/[id]/page.tsx`
- `docs/srs/tv4-ui-and-discovery.md`
- `tests/discovery.test.ts`

#### 2. Trạng thái trong Sprint 1
- **Đã hoàn thành 100% nhiệm vụ Sprint 1 & Sprint 2 của TV4:**
  - Bộ khung Design System Indigo/Slate (`globals.css`), `Navbar` đủ link 8 thành viên, `Footer` Nhóm 5 IT3180.
  - Bộ UI Components dùng chung (`ListingCard`, `StatusBadge`, `PriceText`, `Button`, `Card`, `EmptyState`, `Pagination`, `ModulePlaceholder`) và toàn bộ các trang khung cho TV1, TV3, TV5, TV6, TV7, TV8.
  - Trang chủ (`/`), Trang tìm kiếm & lọc đa tiêu chí (`/listings`), Trang chi tiết sản phẩm (`/listings/[id]`) hiển thị `specsJson` và 3 vùng Action Slots (`data-slot="tv5-purchase-action"`, `data-slot="tv7-exchange-action"`, `data-slot="tv8-report-action"`).
  - Tài liệu `docs/srs/tv4-ui-and-discovery.md` và bộ kiểm thử `tests/discovery.test.ts` (9/9 test pass).

---

### 👤 THÀNH VIÊN 5 (TV5) — Workflow Analyst (Luồng Mua) & Module Yêu cầu mua hàng (Buyer Request)

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/purchase/**`
- `src/app/api/purchase-requests/route.ts`, `src/app/api/purchase-requests/[id]/cancel/route.ts` *(Lưu ý: 2 route `accept` và `reject` thuộc về TV6)*
- `src/app/buyer/requests/**`, `src/app/my-requests/**`
- `docs/srs/module-tv5-purchase.md`
- `tests/purchase.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv5-purchase-sprint1`
2. **Mũ 1 (Workflow Analyst — Luồng Mua):**
   - Tạo `docs/srs/module-tv5-purchase.md`:
     - Vẽ **State Machine Diagram** (Mermaid `stateDiagram-v2`) và **Sequence Diagram** (Mermaid `sequenceDiagram`) cho luồng Người mua gửi yêu cầu mua (`PurchaseRequest`) → Hủy yêu cầu hoặc Người bán phản hồi.
     - Đặc tả chi tiết các quy tắc bất biến:
       1. Chỉ tin đăng có `status === "ACTIVE"` (`isListingAvailableForDeal`) mới nhận được yêu cầu mua.
       2. Người mua không được gửi yêu cầu mua trên tin đăng của chính mình (`buyerId !== listing.sellerId`).
       3. Không gửi trùng yêu cầu khi đã có một `PurchaseRequest` đang ở trạng thái `PENDING` của cùng `buyerId` trên cùng `listingId`.
       4. `offeredPrice >= 0` (`0` nghĩa là đồng ý mua đúng giá niêm yết của tin đăng).
       5. Chỉ được hủy yêu cầu khi `status === "PENDING"` (`canTransitionPurchaseRequest("PENDING", "CANCELLED")`).
3. **Mũ 2 (Code Module Purchase):**
   - Xây dựng tầng nghiệp vụ và API:
     - `src/features/purchase/`: Hàm kiểm tra điều kiện hợp lệ và truy vấn danh sách yêu cầu mua.
     - `POST /api/purchase-requests`: Tạo yêu cầu mua mới (`status = "PENDING"`), kiểm tra đầy đủ 4 quy tắc bất biến trên (vi phạm trả `400 VALIDATION_ERROR` hoặc `409 CONFLICT`).
     - `GET /api/purchase-requests?mine=true&buyerId=...`: Lấy danh sách các yêu cầu mua đã gửi kèm thông tin `listing` và `seller`.
     - `PATCH /api/purchase-requests/[id]/cancel`: Cho phép người mua hủy yêu cầu khi còn `PENDING`.
   - Hoàn thiện giao diện tại `src/app/buyer/requests/page.tsx`: Hiển thị danh sách yêu cầu mua đã gửi (dùng `<StatusBadge entity="purchaseRequest" />`, `<PriceText />`), form gửi thử yêu cầu mua và nút **Huỷ yêu cầu** đối với các yêu cầu đang `PENDING`.
4. **Kiểm thử (`tests/purchase.test.ts`):**
   - Test gửi yêu cầu mua hợp lệ; chặn tự mua tin của chính mình (`400`/`409`); chặn gửi trùng khi đang có yêu cầu `PENDING`; hủy yêu cầu `PENDING -> CANCELLED` thành công.

#### 3. Prompt mẫu cho AI của TV5
```text
Hãy đóng vai Thành viên 5 (Workflow Analyst luồng Mua kiêm phụ trách Module Yêu cầu mua hàng phía người mua).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma, src/lib/listing-state.ts và phần TV5 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git, tạo nhánh feat/tv5-purchase-sprint1 nếu chưa có.
2. Viết tài liệu docs/srs/module-tv5-purchase.md có sơ đồ State Machine và Sequence Diagram bằng Mermaid cùng đặc tả Use Case gửi/huỷ yêu cầu mua.
3. Xây dựng service trong src/features/purchase/ và các API: POST /api/purchase-requests, GET /api/purchase-requests, PATCH /api/purchase-requests/[id]/cancel (lưu ý KHÔNG tạo route accept/reject vì thuộc TV6).
4. Hoàn thiện giao diện quản lý yêu cầu mua tại src/app/buyer/requests/page.tsx sử dụng StatusBadge, PriceText, Button từ @/components/ui.
5. Viết test trong tests/purchase.test.ts (gồm happy path và các case lỗi tự mua tin của mình, gửi trùng, huỷ yêu cầu) và chạy npm run check.
```

---

### 👤 THÀNH VIÊN 6 (TV6) — Workflow Analyst (Luồng Giao dịch) & Module Xử lý đơn mua + Lịch sử giao dịch

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/transaction/**`
- `src/app/api/purchase-requests/[id]/accept/**`, `src/app/api/purchase-requests/[id]/reject/**`
- `src/app/api/transactions/**`
- `src/app/transactions/**`, `src/app/my-transactions/**`
- `docs/srs/module-tv6-transaction.md`
- `tests/transaction.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv6-transaction-sprint1`
2. **Mũ 1 (Workflow Analyst — Luồng Giao dịch):**
   - Tạo `docs/srs/module-tv6-transaction.md`:
     - Vẽ **Activity Diagram** và **State Machine Diagram** bằng Mermaid cho quy trình: Người bán Chấp nhận yêu cầu mua → Khóa `Listing` sang `IN_TRANSACTION` → Sinh bản ghi `Transaction` (`IN_PROGRESS`) → Hai bên xác nhận (`buyerConfirmed && sellerConfirmed`) → Hoàn tất (`COMPLETED` & `Listing` sang `SOLD`) hoặc Hủy (`CANCELLED` & `Listing` quay lại `ACTIVE`).
     - Đặc tả cơ chế **chống Double-Booking** bằng `prisma.$transaction`.
3. **Mũ 2 (Code Module Transaction):**
   - Xây dựng logic nghiệp vụ trong `src/features/transaction/` và các API:
     - `POST /api/purchase-requests/[id]/accept`: Thực hiện trong `prisma.$transaction`:
       1. Kiểm tra `PurchaseRequest.status === "PENDING"` và `Listing.status === "ACTIVE"` (nếu không thỏa trả `409 CONFLICT`).
       2. Cập nhật `PurchaseRequest.status = "ACCEPTED"` và tự động từ chối (`REJECTED`) các yêu cầu `PENDING` khác trên cùng `listingId`.
       3. Cập nhật `Listing.status = "IN_TRANSACTION"` (dùng `assertListingTransition`).
       4. Tạo `Transaction` với `type = "PURCHASE"`, `status = "IN_PROGRESS"`.
     - `POST /api/purchase-requests/[id]/reject`: Chuyển `PurchaseRequest.status` từ `PENDING` sang `REJECTED`.
     - `GET /api/transactions`: Lấy danh sách giao dịch (hỗ trợ lọc theo `role=buyer|seller` hoặc `userId`).
     - `PATCH /api/transactions/[id]/confirm`: Cập nhật `buyerConfirmed = true` hoặc `sellerConfirmed = true`; nếu `isTransactionReadyToComplete` (`buyerConfirmed && sellerConfirmed`) thì chuyển `Transaction.status = "COMPLETED"`, set `completedAt = new Date()`, và chuyển `Listing.status = "SOLD"` (hoặc `"EXCHANGED"` nếu `type === "EXCHANGE"`).
     - `PATCH /api/transactions/[id]/cancel`: Chuyển `Transaction.status = "CANCELLED"` và mở khóa `Listing.status` về `"ACTIVE"`.
   - Hoàn thiện giao diện tại `src/app/transactions/page.tsx`: Hiển thị danh sách đơn mua cần người bán duyệt và danh sách lịch sử giao dịch kèm trạng thái xác nhận 2 bên (`buyerConfirmed`, `sellerConfirmed`).
4. **Kiểm thử (`tests/transaction.test.ts`):**
   - Test chấp nhận yêu cầu mua khóa `Listing` sang `IN_TRANSACTION`; chặn chấp nhận yêu cầu thứ 2 khi `Listing` đã `IN_TRANSACTION` (chống double-booking); xác nhận đủ 2 bên chuyển `Transaction` sang `COMPLETED` và `Listing` sang `SOLD`; hủy giao dịch trả `Listing` về `ACTIVE`.

#### 3. Prompt mẫu cho AI của TV6
```text
Hãy đóng vai Thành viên 6 (Workflow Analyst luồng Giao dịch kiêm phụ trách Module Xử lý đơn mua & Lịch sử giao dịch).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma, src/lib/listing-state.ts và phần TV6 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git, tạo nhánh feat/tv6-transaction-sprint1 nếu chưa có.
2. Viết tài liệu docs/srs/module-tv6-transaction.md kèm sơ đồ Activity Diagram, State Machine bằng Mermaid và quy tắc chống double-booking.
3. Xây dựng service trong src/features/transaction/ và các API: POST /api/purchase-requests/[id]/accept, POST /api/purchase-requests/[id]/reject, GET /api/transactions, PATCH /api/transactions/[id]/confirm, PATCH /api/transactions/[id]/cancel (bắt buộc dùng prisma.$transaction và các hàm trong @/lib/listing-state).
4. Hoàn thiện giao diện quản lý giao dịch tại src/app/transactions/page.tsx.
5. Viết test trong tests/transaction.test.ts kiểm chứng chống double-booking, hoàn tất giao dịch 2 chiều và huỷ giao dịch, sau đó chạy npm run check.
```

---

### 👤 THÀNH VIÊN 7 (TV7) — BA / Designer (Luồng Trao đổi) & Module Đề nghị Trao đổi thiết bị (`ExchangeOffer`)

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/exchange/**`
- `src/app/api/exchange-offers/**`
- `src/app/exchanges/**`, `src/app/exchange/**`
- `docs/srs/module-tv7-exchange.md`
- `tests/exchange.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv7-exchange-sprint1`
2. **Mũ 1 (BA / Designer — Luồng Trao đổi thiết bị):**
   - Tạo `docs/srs/module-tv7-exchange.md`:
     - Đặc tả chi tiết quy trình **Workflow 3 — Trao đổi thiết bị (Y ↔ X)**: Người dùng B chọn thiết bị Y của mình để đề nghị đổi lấy thiết bị X của Người dùng A (kèm tiền bù `cashTopUp`).
     - Vẽ **Sequence Diagram** và **State Diagram** bằng Mermaid mô tả việc khóa **đồng thời cả 2 thiết bị X và Y** sang `IN_TRANSACTION` khi lời đề nghị được chấp nhận.
     - Nêu rõ 5 ràng buộc nghiệp vụ:
       1. Không tự trao đổi với chính mình (`proposerId !== receiverId` và `targetListingId !== offeredListingId`).
       2. Thiết bị đem đi đổi (`offeredListing`) phải thuộc sở hữu của người đề nghị (`offeredListing.sellerId === proposerId`).
       3. Cả 2 thiết bị `targetListing` (X) và `offeredListing` (Y) đều phải đang ở trạng thái `ACTIVE`.
       4. Thiết bị mục tiêu `targetListing` (X) phải bật `allowExchange === true`.
       5. Không gửi trùng đề nghị `PENDING` cho cùng cặp `(targetListingId, offeredListingId)`.
3. **Mũ 2 (Code Module Exchange):**
   - Xây dựng logic nghiệp vụ tại `src/features/exchange/` và các API tại `src/app/api/exchange-offers/`:
     - `POST /api/exchange-offers`: Kiểm tra 5 ràng buộc trên, tạo bản ghi `ExchangeOffer` (`status = "PENDING"`, `cashTopUp >= 0`).
     - `GET /api/exchange-offers`: Lấy danh sách đề nghị trao đổi đã gửi (`box=sent`) và đã nhận (`box=received`) kèm thông tin cả 2 thiết bị X và Y.
     - `PATCH /api/exchange-offers/[id]/accept`: Thực hiện trong `prisma.$transaction`: kiểm tra cả 2 thiết bị X và Y vẫn đang `ACTIVE`, chuyển `ExchangeOffer.status = "ACCEPTED"`, chuyển **cả 2 thiết bị** sang `IN_TRANSACTION`, và tạo `Transaction` (`type = "EXCHANGE"`, `listingId = targetListingId`, `secondaryListingId = offeredListingId`).
     - `PATCH /api/exchange-offers/[id]/reject` & `PATCH /api/exchange-offers/[id]/cancel`: Từ chối hoặc hủy đề nghị khi còn `PENDING`.
   - Hoàn thiện giao diện tại `src/app/exchanges/page.tsx`: Hiển thị trực quan các cặp thiết bị Đề nghị đổi (`Thiết bị của bạn [Y] ⇄ Thiết bị mục tiêu [X]` + số tiền bù `cashTopUp`), kèm nút Chấp nhận / Từ chối / Huỷ đề nghị.
4. **Kiểm thử (`tests/exchange.test.ts`):**
   - Test gửi đề nghị trao đổi hợp lệ; chặn đổi vào tin có `allowExchange = false`; chặn tự đổi tin của chính mình; chấp nhận trao đổi khóa đồng thời cả 2 thiết bị sang `IN_TRANSACTION`.

#### 3. Prompt mẫu cho AI của TV7
```text
Hãy đóng vai Thành viên 7 (BA/Designer luồng Trao đổi kiêm phụ trách Module Đề nghị Trao đổi thiết bị).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma, src/lib/listing-state.ts và phần TV7 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git, tạo nhánh feat/tv7-exchange-sprint1 nếu chưa có.
2. Viết tài liệu docs/srs/module-tv7-exchange.md đặc tả đầy đủ Use Case và sơ đồ Mermaid cho luồng trao đổi 2 thiết bị (X <-> Y).
3. Xây dựng service trong src/features/exchange/ và các API tại src/app/api/exchange-offers/ (POST tạo đề nghị, GET danh sách gửi/nhận, PATCH accept khoá đồng thời 2 listing trong prisma.$transaction, PATCH reject, PATCH cancel).
4. Hoàn thiện giao diện quản lý trao đổi tại src/app/exchanges/page.tsx sử dụng StatusBadge, PriceText, Button từ @/components/ui.
5. Viết test trong tests/exchange.test.ts và chạy npm run check đảm bảo pass 100%.
```

---

### 👤 THÀNH VIÊN 8 (TV8) — QA / Test Lead & Module Báo cáo vi phạm + Admin Dashboard

#### 1. Phạm vi sở hữu file (Chỉ được sửa trong vùng này)
- `src/features/report/**`, `src/features/admin/**`
- `src/app/api/reports/**`, `src/app/api/admin/**`
- `src/app/admin/**`
- `docs/srs/test-plan.md`, `docs/srs/module-tv8-admin-report.md`, `tests/README.md`
- `tests/admin-report.test.ts`

#### 2. Nhiệm vụ chi tiết trong Sprint 1
1. **Nhánh Git:** `git checkout -b feat/tv8-admin-qa-sprint1`
2. **Mũ 1 (QA / Test Lead):**
   - Tạo `docs/srs/test-plan.md`: Kế hoạch kiểm thử tổng thể cho dự án Nhóm 5 (Chiến lược kiểm thử Unit Test, API Integration Test, Ma trận kiểm thử các quy tắc chuyển trạng thái State Machine, và Kịch bản Demo từng bước cho Sprint 1).
   - Tạo `docs/srs/module-tv8-admin-report.md`: Đặc tả Use Case Người dùng gửi Báo cáo vi phạm (`UC-REP-01`), Admin duyệt/từ chối tin đăng mới (`UC-ADM-01`), Admin xử lý báo cáo vi phạm (`UC-ADM-02`), Admin khóa/mở khóa tài khoản người dùng (`UC-ADM-03`).
3. **Mũ 2 (Code Module Report & Admin Dashboard):**
   - Xây dựng logic trong `src/features/report/` và `src/features/admin/`:
     - `POST /api/reports`: Người dùng gửi báo cáo vi phạm (`listingId`, `reporterId`, `reason`, `description?`); chặn tự báo cáo tin của chính mình và chặn báo cáo trùng khi đã có báo cáo `PENDING`.
     - `GET /api/admin/listings`: Lấy danh sách tin đăng (mặc định lọc `status=PENDING` như tin `lst-tab-s9` trong dữ liệu seed để Admin duyệt).
     - `PATCH /api/admin/listings/[id]/approve`: Chuyển tin từ `PENDING -> ACTIVE` (dùng `assertListingTransition`).
     - `PATCH /api/admin/listings/[id]/reject`: Chuyển tin từ `PENDING -> REJECTED`.
     - `GET /api/reports` & `PATCH /api/reports/[id]`: Admin xem và cập nhật trạng thái báo cáo (`RESOLVED` / `DISMISSED` kèm `adminNote`; nếu `RESOLVED` có thể đồng thời ẩn tin vi phạm).
     - `GET /api/admin/users` & `PATCH /api/admin/users/[id]/status`: Admin xem danh sách người dùng và đổi trạng thái `ACTIVE <-> LOCKED`.
   - Hoàn thiện giao diện Admin Dashboard tại `src/app/admin/page.tsx`: Hiển thị thẻ thống kê toàn sàn, bảng **Tin đăng chờ duyệt (`PENDING`)** với nút Duyệt / Từ chối, bảng **Báo cáo vi phạm (`Report`)** và bảng **Quản lý người dùng**.
4. **Kiểm thử (`tests/admin-report.test.ts`):**
   - Test Admin duyệt tin `PENDING -> ACTIVE` thành công; chặn duyệt tin đã `SOLD`; gửi báo cáo vi phạm hợp lệ và chặn tự báo cáo tin của chính mình; Admin xử lý báo cáo sang `RESOLVED`.

#### 3. Prompt mẫu cho AI của TV8
```text
Hãy đóng vai Thành viên 8 (QA / Test Lead kiêm phụ trách Module Báo cáo vi phạm & Admin Dashboard).
Trước tiên hãy đọc kỹ AGENTS.md, prisma/schema.prisma, src/lib/listing-state.ts và phần TV8 trong MEMBER-AI-PLAYBOOK.md.
1. Kiểm tra nhánh Git, tạo nhánh feat/tv8-admin-qa-sprint1 nếu chưa có.
2. Viết kế hoạch kiểm thử docs/srs/test-plan.md và đặc tả docs/srs/module-tv8-admin-report.md.
3. Xây dựng service trong src/features/report/, src/features/admin/ và các API tại src/app/api/reports/**, src/app/api/admin/** (duyệt/từ chối tin PENDING, gửi và xử lý Report, khoá/mở khoá User).
4. Hoàn thiện giao diện Admin Dashboard tại src/app/admin/page.tsx sử dụng StatusBadge, PriceText, Button, Card từ @/components/ui.
5. Viết test trong tests/admin-report.test.ts và chạy npm run check đảm bảo pass 100%.
```

---

## PHẦN IV — BẢNG TỔNG KIỂM TRA TRƯỚC KHI MỞ PULL REQUEST (CHECKLIST CHO MỌI THÀNH VIÊN)

Trước khi bấm `git push` và tạo Pull Request vào nhánh `develop`, từng thành viên (và AI của thành viên đó) phải tự tích đủ 7 mục sau:

- [ ] **1. Đúng nhánh:** Đang ở nhánh `feat/tvX-...` (không phải `main` hay `develop`).
- [ ] **2. Đúng phân vùng:** Chạy `git status` kiểm tra không có file nào nằm ngoài phân vùng của mình trong `AGENTS.md` bị sửa đổi.
- [ ] **3. Không lộ dữ liệu nhạy cảm:** Không commit file `.env`, `prisma/dev.db`, không trả `passwordHash` trong bất kỳ API nào.
- [ ] **4. Không vi phạm quy ước TypeScript:** Không dùng `any`, không dùng `new PrismaClient()` ngoài `src/lib/prisma.ts`.
- [ ] **5. Có đủ bộ 3 sản phẩm (Mũ kép):** Có **File tài liệu SRS** (`docs/srs/...`) + **File Code FE/API** (`src/...`) + **File Test** (`tests/...`).
- [ ] **6. Vượt qua kiểm tra tự động:** Chạy lệnh `npm run check` báo **0 lỗi TypeScript** và **100% test cases PASS**.
- [ ] **7. Có Review chéo:** Gắn tên ít nhất 1 thành viên khác vào mục **Reviewers** trên GitHub Pull Request trước khi Merge vào `develop`.
