# AGENTS.md — LUẬT DÀNH CHO AI AGENT CỦA CẢ 8 THÀNH VIÊN

> **Đọc file này TRƯỚC khi viết bất kỳ dòng code nào.**
> Mỗi thành viên dùng AI Agent riêng (Cursor, Copilot, Antigravity, Claude Code…).
> Nếu 8 agent cùng sửa một chỗ, dự án sẽ hỏng. File này là "luật giao thông".

---

## 0. BẠN ĐANG LÀM VIỆC TRONG DỰ ÁN NÀO

**Electronics Trading & Exchange Marketplace** — sàn C2C cho phép người dùng
đăng tin **mua bán** và **trao đổi** thiết bị điện tử mới/đã qua sử dụng.

- **Nhóm 5** — học phần Nhập môn Công nghệ phần mềm (IT3180)
- Chạy **hoàn toàn trên máy local**, không deploy, không CI/CD
- 8 thành viên, mỗi người sở hữu 1 phân hệ dọc (FE + API + Test)

**Ngoài phạm vi (KHÔNG tự thêm):** thanh toán online, vận chuyển, ký quỹ,
chat, đánh giá/rating, đấu giá, AI gợi ý.

---

## 1. TECH STACK (KHÔNG ĐƯỢC ĐỔI)

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server Components mặc định |
| Ngôn ngữ | **TypeScript** `strict: true` | **Cấm `any`** |
| UI | **Tailwind CSS v4** | Không dùng thư viện UI khác nếu chưa được duyệt |
| ORM | **Prisma 6** | Client singleton tại `src/lib/prisma.ts` |
| Database | **SQLite** (`prisma/dev.db`) | Không cần cài DB server |
| Auth | JWT trong **httpOnly cookie** | **Cấm** lưu token vào localStorage |
| Hash | **bcryptjs** | Cost 10 |
| Test | **Vitest** (`/tests`) | Chạy `npm test` |

**Cấm thêm dependency mới** khi chưa được TV1 (PM) duyệt. Không thêm
Redux, axios, react-query, UI kit khác, state library…

---

## 2. LỆNH CHUẨN

```bash
npm install            # cài dependencies
npx prisma db push     # tạo/cập nhật DB theo schema (SQLite)
npx prisma db seed     # nạp dữ liệu mẫu
npx prisma generate    # sinh lại Prisma Client (sau khi schema đổi)
npm run dev            # chạy dev server: http://localhost:3000
npm run build          # build production (phải pass trước khi merge)
npm run check          # typecheck + test (BẮT BUỘC chạy trước khi commit)
npm run db:reset       # xoá DB + tạo lại + seed
```

**Trước khi kết thúc task, AI phải chạy:** `npm run check` và báo lại kết quả.

---

## 3. PHÂN VÙNG SỞ HỮU — AI TUYỆT ĐỐI KHÔNG SỬA NGOÀI VÙNG

> Đây là phần **quan trọng nhất** của file. Nếu task yêu cầu sửa file ngoài vùng
> của bạn → **DỪNG LẠI**, báo người dùng mở issue/liên hệ chủ sở hữu.

| TV | Mũ 1 (CNPM) | Mũ 2 (Module code) | **Vùng được sửa (write)** |
|---|---|---|---|
| **TV1** | PM / Scrum Master | Auth & Hồ sơ | `src/features/auth/**`, `src/app/api/auth/**`, `src/app/(auth)/**`, `src/app/profile/**`, `src/lib/auth.ts`, `src/middleware.ts`, `docs/srs/module-tv1-auth.md`, `tests/auth.test.ts` |
| **TV2** | System / DB Architect | Base Setup & Danh mục | `prisma/**`, `src/lib/prisma.ts`, `src/lib/constants.ts`, `src/lib/api-response.ts`, `src/lib/listing-state.ts`, `src/features/catalog/**`, `src/app/api/categories/**`, `src/app/api/brands/**`, `docs/diagrams/**`, `docs/srs/module-tv2-catalog.md`, `tests/listing-state.test.ts`, `tests/api-catalog.test.ts`, `AGENTS.md` |
| **TV3** | BA Lead | Đăng tin & Quản lý tin bán | `src/features/listing/**`, `src/app/api/listings/**`, `src/app/listings/create/**`, `src/app/seller/listings/**`, `src/app/my-listings/**`, `docs/srs/README.md`, `docs/srs/overview.md`, `docs/srs/module-tv3-listing.md`, `tests/listing.test.ts` |
| **TV4** | UI/UX Lead | Khám phá, Tìm kiếm & Lọc | `src/features/discovery/**`, `src/components/layout/**`, `src/components/ui/**`, `src/app/page.tsx`, `src/app/listings/page.tsx`, `src/app/listings/loading.tsx`, `src/app/listings/error.tsx`, `src/app/listings/[id]/**`, `src/app/layout.tsx`, `src/app/globals.css`, `docs/srs/module-tv4-discovery.md`, `docs/srs/tv4-ui-and-discovery.md`, `tests/discovery.test.ts` |
| **TV5** | Workflow Analyst (Mua) | Yêu cầu mua — phía người mua | `src/features/purchase/**`, `src/app/api/purchase-requests/route.ts`, `src/app/api/purchase-requests/[id]/cancel/**`, `src/app/buyer/requests/**`, `src/app/my-requests/**`, `docs/srs/module-tv5-purchase.md`, `tests/purchase.test.ts` |
| **TV6** | Workflow Analyst (Giao dịch) | Xử lý đơn mua & Lịch sử giao dịch | `src/features/transaction/**`, `src/app/api/transactions/**`, `src/app/transactions/**`, `src/app/my-transactions/**`, `src/app/api/purchase-requests/[id]/accept/**`, `src/app/api/purchase-requests/[id]/reject/**`, `docs/srs/module-tv6-transaction.md`, `tests/transaction.test.ts` |
| **TV7** | BA/Designer (Trao đổi) | Đề nghị Trao đổi | `src/features/exchange/**`, `src/app/api/exchange-offers/**`, `src/app/exchanges/**`, `src/app/exchange/**`, `docs/srs/module-tv7-exchange.md`, `tests/exchange.test.ts` |
| **TV8** | QA / Test Lead | Báo cáo vi phạm & Admin | `src/features/report/**`, `src/features/admin/**`, `src/app/api/reports/**`, `src/app/api/admin/**`, `src/app/admin/**`, `tests/README.md`, `tests/report-admin.test.ts`, `docs/srs/test-plan.md`, `docs/srs/module-tv8-admin-report.md` |

**Được ĐỌC (read-only) tất cả các vùng còn lại.** Muốn dùng hàm của người khác →
import, không copy-paste và không sửa.

### File dùng chung — chỉ đúng người được sửa

| File | Chủ sở hữu | Người khác |
|---|---|---|
| `prisma/schema.prisma` | **TV2** | Xin TV2 đổi, tự thêm bảng là cấm |
| `src/lib/prisma.ts` | **TV2** | Chỉ import `{ prisma }` |
| `src/lib/constants.ts` | **TV2** | Import giá trị, không tự định nghĩa lại |
| `src/lib/listing-state.ts` | **TV2** | Import hàm `canTransition*` |
| `src/lib/api-response.ts` | **TV2** | Import `ok/fail/handleApiError` |
| `src/app/layout.tsx`, `globals.css` | **TV4** | Không sửa |
| `src/app/page.tsx` | **TV4** | Không sửa (trang tạm của TV2 sẽ bị thay) |
| `src/components/ui/**` | **TV4** | Không sửa, chỉ import |
| `docs/srs/module-tvX-*.md` | **TV1–TV8** | Mỗi TV chỉ tạo/sửa file SRS của module mình; `README.md` và `overview.md` do TV3 chủ trì |
| `tests/<module>.test.ts` | Người tạo file | Không sửa test của người khác |

---

## 4. QUY TẮC GỌI PRISMA (BẮT BUỘC)

```ts
// ✅ ĐÚNG
import { prisma } from "@/lib/prisma";

const listings = await prisma.listing.findMany({
  where: { status: "ACTIVE" },
  take: 20,
});

// ❌ SAI — tạo client mới, sẽ làm hỏng kết nối SQLite
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

**Bốn điều cấm khi dùng Prisma:**

1. Cấm `new PrismaClient()` ngoài `src/lib/prisma.ts`.
2. Cấm `$queryRaw` / `$executeRaw` (SQL thô) — muốn dùng phải xin TV2.
3. Cấm trả thẳng object Prisma ra client nếu có `passwordHash` (phải `select`).
4. Cấm gọi Prisma trong Client Component (`"use client"`). Chỉ Server Component,
   Route Handler, Server Action.

**Luôn `select` đúng cột cần dùng**, không `findMany()` rồi trả cả object.

---

## 5. MÃ LỖI & FORMAT API (BẮT BUỘC THỐNG NHẤT)

Mọi route handler trả về **một trong hai** dạng:

```jsonc
// Thành công
{ "data": { /* ... */ } }

// Thất bại
{ "error": { "code": "VALIDATION_ERROR", "message": "Giá phải lớn hơn 0" } }
```

| HTTP | code | Dùng khi |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Dữ liệu đầu vào sai |
| 401 | `UNAUTHENTICATED` | Chưa đăng nhập / token sai |
| 403 | `FORBIDDEN` | Không có quyền (sai role hoặc không phải chủ sở hữu) |
| 404 | `NOT_FOUND` | Không tồn tại |
| 409 | `CONFLICT` | Trùng dữ liệu / trạng thái không cho phép |
| 500 | `INTERNAL_ERROR` | Lỗi không mong đợi |

Dùng helper có sẵn:

```ts
import { ok, fail, handleApiError, getPagination } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const { page, limit, skip } = getPagination(new URL(req.url).searchParams);
    return ok({ items, page, limit });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Phân trang chuẩn:** `?page=1&limit=20` → trả `{ data: { items, page, limit, total } }`.

---

## 6. QUY TẮC CHUYỂN TRẠNG THÁI (STATE MACHINE)

SQLite **không hỗ trợ enum** → trạng thái là `String`, giá trị hợp lệ nằm trong
`src/lib/constants.ts`. **Không hardcode chuỗi trạng thái.**

### 6.1 Listing

```
PENDING  --Admin duyệt-->          ACTIVE
PENDING  --Admin từ chối-->        REJECTED
ACTIVE   --Người bán ẩn-->         HIDDEN
HIDDEN   --Người bán bỏ ẩn-->      ACTIVE
ACTIVE   --Có giao dịch được nhận-> IN_TRANSACTION
IN_TRANSACTION --Hủy giao dịch-->  ACTIVE
IN_TRANSACTION --Mua hoàn tất-->   SOLD
IN_TRANSACTION --Trao đổi xong-->  EXCHANGED
REJECTED --Người bán sửa tin-->    PENDING   (bắt buộc duyệt lại)
```

| Từ | Sang (hợp lệ) |
|---|---|
| `PENDING` | `ACTIVE`, `REJECTED` |
| `ACTIVE` | `IN_TRANSACTION`, `HIDDEN`, `REJECTED` |
| `IN_TRANSACTION` | `ACTIVE`, `SOLD`, `EXCHANGED` |
| `HIDDEN` | `ACTIVE`, `REJECTED` |
| `REJECTED` | `PENDING` |
| `SOLD` | *(kết thúc)* |
| `EXCHANGED` | *(kết thúc)* |

**Bất biến:**
- `SOLD` / `EXCHANGED` là trạng thái cuối — không được chuyển ra.
- Một listing chỉ được nằm trong **tối đa 1 giao dịch** `IN_TRANSACTION`.
- Chỉ `ACTIVE` mới nhận được `PurchaseRequest` / `ExchangeOffer` mới.
- Sửa nội dung listing đã `ACTIVE` → phải đưa về `PENDING`.

### 6.2 Transaction

```
IN_PROGRESS --buyerConfirmed && sellerConfirmed--> COMPLETED
IN_PROGRESS --một bên hủy------------------------> CANCELLED
```

| Từ | Sang (hợp lệ) |
|---|---|
| `IN_PROGRESS` | `COMPLETED`, `CANCELLED` |
| `COMPLETED` | *(kết thúc)* |
| `CANCELLED` | *(kết thúc)* |

**Bất biến:**
- Không `COMPLETED` nếu thiếu 1 trong 2 cờ xác nhận.
- Khi `COMPLETED`: `Listing.status` → `SOLD` (mua) hoặc `EXCHANGED` (trao đổi),
  `completedAt` được set.
- Khi `CANCELLED`: listing liên quan quay lại `ACTIVE` (nếu chưa SOLD/EXCHANGED).
- Mỗi `PurchaseRequest` / `ExchangeOffer` chỉ sinh ra **tối đa 1** Transaction.

**Luôn dùng hàm có sẵn, đừng tự so sánh chuỗi:**

```ts
import { canTransitionListing, assertListingTransition } from "@/lib/listing-state";
import { LISTING_STATUS } from "@/lib/constants";

assertListingTransition(listing.status as ListingStatus, LISTING_STATUS.SOLD);
```

### 6.3 PurchaseRequest / ExchangeOffer

| Từ | Sang (hợp lệ) |
|---|---|
| `PENDING` | `ACCEPTED`, `REJECTED`, `CANCELLED` |
| `ACCEPTED` / `REJECTED` / `CANCELLED` | *(kết thúc)* |

Bất biến: không ai gửi yêu cầu/đề nghị trên tin của chính mình; không gửi trùng
khi đã có yêu cầu `PENDING` trên cùng listing.

---

## 7. QUY ƯỚC CODE

```
src/
├─ app/                    # Next.js App Router (routes + API)
│  ├─ api/<domain>/        # Route Handlers - chia theo phân vùng ở mục 3
│  ├─ (auth)/              # TV1: login, register
│  ├─ profile/             # TV1: hồ sơ cá nhân
│  ├─ listings/            # TV4: khám phá & chi tiết (riêng listings/create thuộc TV3)
│  ├─ seller/listings/     # TV3: quản lý tin bán (kèm my-listings/)
│  ├─ buyer/requests/      # TV5: yêu cầu mua (kèm my-requests/)
│  ├─ transactions/        # TV6: đơn bán & lịch sử giao dịch (kèm my-transactions/)
│  ├─ exchanges/           # TV7: đề nghị trao đổi (kèm exchange/)
│  └─ admin/               # TV8: quản trị & xử lý báo cáo
├─ components/
│  ├─ layout/              # TV4: Navbar, Footer
│  └─ ui/                  # TV4: Button, Card, Input… (dùng chung)
├─ features/
│  ├─ auth/                # TV1
│  ├─ catalog/             # TV2
│  ├─ listing/             # TV3
│  ├─ discovery/           # TV4
│  ├─ purchase/            # TV5
│  ├─ transaction/         # TV6
│  ├─ exchange/            # TV7
│  ├─ report/  admin/      # TV8
└─ lib/                    # TV2: prisma, constants, api-response, listing-state
```

**Đặt tên:**

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `ListingCard.tsx` |
| Hook | `use-kebab-case.ts` + `useXxx` | `use-listing-filters.ts` |
| Hàm/thư viện | `kebab-case.ts` | `listing-state.ts` |
| API route | danh từ số nhiều | `/api/listings`, `/api/purchase-requests` |
| Cột DB | `camelCase` trong schema, `snake_case` dưới bảng (@@map) | `sellerId` → `seller_id` |

**Cấm:** `any`, `@ts-ignore`, `console.log` sót lại, `dangerouslySetInnerHTML`.

---

## 8. QUY TẮC DÙNG AI AGENT (CHO CHÍNH AI ĐANG ĐỌC FILE NÀY)

1. **Trước khi code:** kiểm tra task có thuộc vùng của bạn không (mục 3).
   Nếu không → dừng, hỏi người dùng.
2. **Không tự mở rộng phạm vi:** không thêm bảng, không thêm route, không thêm
   dependency, không "tiện tay refactor" file khác.
3. **Sửa ít nhất có thể:** chỉ file thật sự cần cho task.
4. **Không đổi schema DB.** Cần cột mới → báo TV2.
5. **Không tạo Prisma Client mới.** Import từ `@/lib/prisma`.
6. **Luôn kết thúc bằng:** `npm run check` và tóm tắt file đã sửa.
7. **Nếu test fail do phần của người khác** → báo, không tự sửa code họ.
8. **Không xoá code người khác** dù thấy "không dùng".
9. **Comment tiếng Việt** cho logic nghiệp vụ; tên biến/hàm tiếng Anh.
10. **Không bịa API đã có.** Kiểm tra `src/app/api/**` trước khi gọi.

---

## 9. QUY TRÌNH GIT

```bash
git checkout develop
git pull origin develop
git checkout -b feat/tv3-listing-create

# ... code ...

git add .
git commit -m "feat(listing): API tạo tin đăng [TV3]"
git push origin feat/tv3-listing-create
# → mở Pull Request vào develop, nhờ 1 người khác review
```

**Nhánh:** `main` (demo), `develop` (tích hợp), `feat/tvX-<mô-tả>` (cá nhân).

**Commit:** `feat|fix|docs|test|chore(<module>): <mô tả> [TVx]`

**Không ai push trực tiếp lên `main`.** PR phải có ≥1 người approve.

---

## 10. DEFINITION OF DONE

- [ ] Đúng phạm vi task, không sửa file ngoài vùng
- [ ] `npm run check` xanh (typecheck + test)
- [ ] `npm run build` pass (với task có UI/route mới)
- [ ] Có test cho happy path + ít nhất 1 case lỗi
- [ ] Không có `any`, không `console.log`
- [ ] Đã chạy thử tay trên `npm run dev`
- [ ] PR có mô tả + ảnh chụp (nếu là UI)

---

## 11. DANH SÁCH FILE KHÔNG ĐƯỢC CHẠM (mọi TV)

```
package.json / package-lock.json   → chỉ TV2 + TV1
prisma/schema.prisma               → chỉ TV2
prisma/seed.ts                     → chỉ TV2
tsconfig.json, next.config.ts      → chỉ TV2
vitest.config.ts                   → chỉ TV2
src/lib/prisma.ts, constants.ts,
  api-response.ts, listing-state.ts → chỉ TV2
src/app/layout.tsx, globals.css    → chỉ TV4
src/app/page.tsx                   → chỉ TV4
.env, .env.local                   → không ai commit
```

---

*Cập nhật lần cuối: Sprint 1 — TV2 (System/DB Architect).*
*Muốn sửa file này: đề xuất với TV2, cả nhóm thống nhất rồi mới đổi.*

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
