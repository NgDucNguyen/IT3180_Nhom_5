# SPRINT 1 — KẾ HOẠCH LOCAL-ONLY (48 SP)
**Dự án:** Electronics Trading & Exchange Marketplace · Nhóm 5
**Phạm vi:** chạy hoàn toàn trên máy local, không deploy, không CI/CD.
**8 người · 4 stream · 11 đầu việc · Gate G1 (design freeze) → G2 (demo path chạy) → G3 (demo)**

---

## 0. LOCAL-ONLY LÀM THAY ĐỔI GÌ SO VỚI BẢN TRƯỚC

| Hạng mục | Trước | Nay |
|---|---|---|
| CI/CD | GitHub Actions | ❌ Bỏ. Thay bằng `make check` + **pre-commit hook** |
| Deploy | Môi trường staging | ❌ Bỏ. Chỉ `make dev` |
| Docker | Compose cả api + web + db | ✅ Chỉ **PostgreSQL**; api/web chạy `pnpm dev` |
| Auth cookie | `Secure` + HTTPS | `httpOnly`, `Secure=false` (localhost), **Vite proxy** để tránh lỗi CORS/credentials |
| Hạ tầng | Domain, monitoring, backup | ❌ Bỏ hết |
| **1.6** | 3 SP (có CI) | **2 SP** (bỏ CI, thêm README chạy trên máy trắng) |
| **1.11** | *(không có)* | **3 SP MỚI** — khung FE dùng chung |
| **Tổng** | 46 SP | **48 SP** |

**Vì sao phải thêm 1.11:** hiện tại Phi Hoàng và Vũ Tâm đều phải tự dựng layout, api client, xử lý lỗi → **2 agent sẽ viết 2 bộ trùng nhau**. Đây là lỗi kinh điển khi vibecode song song.

**Rủi ro riêng của local-only (đưa vào 1.10):**
- Giảng viên/người khác không chạy được vì thiếu bước cài đặt → README "máy trắng" + `.env.example`.
- Máy demo chết, DB hỏng, mạng lỗi → **quay video demo dự phòng 3–5 phút** trước ngày demo.
- 8 máy khác phiên bản Node/Postgres → pin version (`.nvmrc`, `postgres:16`, pnpm qua `packageManager`).

### Quy ước môi trường (bắt buộc thống nhất, làm trong 1.6)

```
Node 22 LTS (.nvmrc)   ·   pnpm 10 (packageManager trong package.json)
PostgreSQL 16 (docker compose, port 5432)
API  http://localhost:3000   ·   WEB  http://localhost:5173
Vite proxy: /api  →  http://localhost:3000   (cookies hoạt động same-origin)
```

```makefile
make dev        # docker compose up -d db && pnpm -r dev
make db:up      # chỉ bật postgres
make reset-db   # drop + migrate + seed
make seed       # dữ liệu mẫu
make check      # lint + typecheck + unit test (< 60s)
make test:api   # integration test (cần db:up)
```

---

## 1. DANH SÁCH 11 ĐẦU VIỆC + THỨ TỰ THỰC HIỆN

| Thứ tự | ID | Đầu việc | Loại | SP | Người | Bắt đầu khi | Chặn ai |
|---|---|---|---|---|---|---|---|
| 1 | **1.6** | Repo local + Docker DB + Makefile + AGENTS.md + pre-commit + README | Dev | 2 | Đức Nguyên | **Ngay D1** | Toàn bộ code |
| 2 | **1.1** | Chốt yêu cầu & MVP (kèm quyết định phạm vi local) | Analysis | 5 | Gia Khanh Pham + cả nhóm | **Ngay D1** | Tất cả |
| 3 | **1.2** | User story + acceptance criteria | Analysis | 3 | Gia Khanh Pham | Sau 1.1 ~nửa ngày | 1.10 |
| 4 | **1.5** | Wireframe 4 màn hình + design token | Design | 3 | Vũ Tâm | D1 (song song 1.1) | 1.11, 1.8-FE, 1.9-FE |
| 5 | **1.3** | State machine + business rules | Analysis | 3 | Đăng Minh | Sau 1.1 | 1.4, 1.7, 1.8, 1.9 |
| 6 | **1.4** | ERD + kiến trúc + `openapi.yaml` | Design | 5 | Thái Dương | Sau **bản nháp** 1.3 | 1.7 |
| 7 | **1.7** | Schema DB + migration + **seed** | Dev | 5 | Đức Nguyên (schema 3) + Anh Duck (seed 2) | Sau ERD (1.4) | 1.8, 1.9 |
| 8 | **1.11** | Khung FE dùng chung: routing, layout, api client, MSW | Dev | 3 | Phi Hoàng (1.5) + Minh Việt (1.5) | D2 (sau 1.5 + openapi v0) | 1.8-FE, 1.9-FE |
| 9 | **1.8** | Đăng ký/đăng nhập + RBAC | Dev | 8 | Minh Việt (BE 4) + Phi Hoàng (FE 4) | Sau bảng `users` | 1.9 (cần guard) |
| 10 | **1.9** | Tạo/xem/ẩn tin đăng + phân trang | Dev | 8 | Anh Duck (BE 4) + Vũ Tâm (FE 4) | Sau bảng `listings` + **guard** | Demo |
| 11 | **1.10** | Test case + kịch bản demo + **video dự phòng** | Testing | 3 | Đăng Minh + cả nhóm | Viết từ D3, chạy D9 | — |

**Hai mốc mở khoá sớm (đừng làm bản "hoàn chỉnh" rồi mới giao):**
- `openapi.yaml` **v0** (auth + categories/brands) xong **cuối D2** → stream C code ngay.
- Bảng `users` xong **D4** (trước khi có listings) → auth chạy trước 1 ngày.

---

## 2. CHIA LẠI CÔNG VIỆC CHO 8 THÀNH VIÊN

| Thành viên | Stream | Đầu việc (SP) | Tổng | Vùng file sở hữu |
|---|---|---|---|---|
| **Gia Khanh Pham** | A. Product | 1.1 (5) + 1.2 (3) | **8** | `docs/requirements/`, `docs/ai/task-cards/`, board |
| **Nguyễn Đăng Minh** | A. QA | 1.3 (3) + 1.10 (3) | **6** | `docs/design/state-machine.md`, `docs/test/` |
| **Đỗ Thái Dương** | B. Arch | 1.4 (5) | **5** | `docs/design/` (trừ state-machine), `packages/contracts/` |
| **Nguyễn Đức Nguyên** | B. Platform | 1.6 (2) + 1.7-schema (3) | **5** | `apps/api/prisma/schema.prisma` + `migrations/`, `Makefile`, `docker-compose.yml`, `AGENTS.md`, `.husky/` |
| **Nguyễn Minh Việt** | C. Auth BE + nền FE | 1.8-BE (4) + 1.11-api client/MSW (1.5) | **5.5** | `apps/api/src/modules/auth/`, `apps/api/src/common/`, `apps/web/src/shared/api/`, `apps/web/src/mocks/` |
| **Phi Hoàng** | C. Auth FE + nền FE | 1.8-FE (4) + 1.11-shell/layout (1.5) | **5.5** | `apps/web/src/app/`, `apps/web/src/features/auth/`, `apps/web/src/shared/ui/` |
| **Vu Anh Duck** | D. Listings BE | 1.7-seed (2) + 1.9-BE (4) | **6** | `apps/api/prisma/seed.ts`, `apps/api/src/modules/listings/` |
| **Vũ Tâm** | D. Listings FE | 1.5 (3) + 1.9-FE (4) | **7** | `docs/design/wireframes/`, `apps/web/src/features/listings/` |

**Cân bằng:** 5 → 8 SP. Người cao nhất (Gia Khanh Pham) phần lớn là 1.1 làm cùng cả nhóm. **Không ai dưới 5 SP.**

---

## 3. LỊCH D1–D13 (8 người chạy song song)

| Người | D1–D2 | D3–D4 | D5–D7 | D8–D11 | D12–D13 |
|---|---|---|---|---|---|
| Gia Khanh Pham | **1.1** → **1.2** | Review 1.3, chốt G1 | Khung SRS | Hỗ trợ ghép nối | Slide + retro |
| Đăng Minh | **1.3 nháp** | **1.3 chốt** ⚠️ | Test case từ AC | Test case chạy | **1.10** |
| Thái Dương | openapi **v0** | **1.4** ERD + v1 | Review contract | Review PR | Rà tài liệu |
| Đức Nguyên | **1.6** repo + Makefile | schema **users** | schema còn lại | Hỗ trợ migration | Chốt seed demo |
| Minh Việt | Đọc contract (chưa code) | api client + MSW | **1.8-BE** + guard sớm D6 | Hoàn thiện 1.8 | Bugfix |
| Phi Hoàng | Dựng layout trống | **1.11** shell | **1.8-FE** | Ghép thật | Bugfix |
| Anh Duck | Khung module | **1.7 seed** | **1.9-BE** | Ghép + fix | Bugfix |
| Vũ Tâm | **1.5** wireframe | Design token | **1.9-FE** (mock) | Ghép + fix | Bugfix |

> D1–D2 có 3 người chưa code được tính năng — đúng. Hai mốc mở khoá sớm ở mục 1 chính là để rút ngắn khoảng trống này.

---

## 4. TASK CARD + PROMPT

### Luật chung (dán kèm mọi prompt)

```
Bối cảnh: dự án chạy HOÀN TOÀN LOCAL. Không CI/CD, không deploy. Node 22 + pnpm. PostgreSQL qua docker compose.
Luật:
1. Không sửa file ngoài danh sách được giao.
2. schema.prisma chỉ Nguyễn Đức Nguyên sửa · openapi.yaml chỉ Đỗ Thái Dương sửa.
3. Không thêm dependency mới nếu chưa được duyệt.
4. Không lưu token vào localStorage; không log mật khẩu/token.
5. Trước khi kết thúc: chạy `make check` và báo cáo kết quả.
6. PR ≤ 400 dòng, kèm test cho happy path + ít nhất 1 case lỗi.
```

---

### TV1 — Gia Khanh Pham — PM/BA · 8 SP · Task 1.1, 1.2

**File:** `docs/requirements/mvp-scope.md`, `docs/requirements/user-stories.md`

**AC:** in/out-scope rõ, có danh sách "không làm" · 6 story có AC kiểm chứng được · ghi rõ 2 quyết định (tin đăng hiển thị ngay với `status=APPROVED`; không upload ảnh Sprint 1) · ghi rõ "chạy local, không deploy".

```
PROMPT
Bạn là BA/PM. Đọc PROJECT PROPOSAL.md (mục 3, 4, 5).

1. docs/requirements/mvp-scope.md: mục tiêu Sprint 1; IN-SCOPE; OUT-OF-SCOPE nêu rõ tìm kiếm/lọc,
   trao đổi, kiểm duyệt, báo cáo, upload ảnh, thanh toán, vận chuyển; và mục "Hạ tầng":
   chạy local, PostgreSQL qua Docker, không CI/CD, không deploy, không HTTPS.
2. docs/requirements/user-stories.md: 6 story (đăng ký, đăng nhập, xem danh sách, tạo tin, tin của tôi,
   guard admin). Mỗi story: ID, vai trò, mong muốn, mục đích, 3-5 AC dạng Given-When-Then,
   endpoint liên quan, và ghi chú "kiểm chứng bằng test case nào".

Chỉ viết tài liệu, KHÔNG viết code. AC nào không viết được thành test case thì AC đó chưa đạt.
```

---

### TV2 — Nguyễn Đăng Minh — SA + QA · 6 SP · Task 1.3, 1.10

**File:** `docs/design/state-machine.md`, `docs/test/business-rules-test-matrix.md`, `docs/test/demo-script.md`

```
PROMPT
Bạn là System Analyst. Đọc PROJECT PROPOSAL.md mục 2, 4, 5 (Workflow 3 "Quy tắc cơ bản").

Viết docs/design/state-machine.md cho Listing, PurchaseRequest, ExchangeOffer, Deal, gồm:
(a) enum trạng thái từng entity (UPPER_SNAKE + mô tả tiếng Việt);
(b) bảng transition: từ → sự kiện → điều kiện → đích → actor được phép;
(c) INVARIANT bắt buộc:
    - 1 listing tối đa thuộc 1 deal ở CONFIRMED/IN_PROGRESS;
    - không gửi ExchangeOffer trên listing của chính mình;
    - chỉ listing APPROVED + AVAILABLE mới mua/trao đổi được;
    - offer REJECTED/EXPIRED → 2 listing về AVAILABLE;
    - sửa listing APPROVED → quay về PENDING;
    - chỉ ADMIN được APPROVE/REJECT listing và xử lý Report;
(d) Mermaid stateDiagram-v2 cho Listing và Deal;
(e) ghi chú trạng thái nào CHƯA dùng ở Sprint 1 (kiểm duyệt là Sprint 4) nhưng vẫn phải có trong schema.

Ràng buộc: không viết code. Mỗi transition trả lời được "ai bấm nút này".
```

**Task 1.10 (từ D9):**
```
Viết docs/test/demo-script.md: kịch bản demo 5-7 phút chạy local
(seed → đăng nhập → tạo tin → thấy tin trong danh sách → ẩn tin), kèm câu nói thuyết trình,
lệnh cần chạy trước khi demo (make reset-db, make seed, make dev), và checklist dự phòng:
video demo 3-5 phút, ảnh chụp màn hình, dữ liệu seed đã kiểm tra.
```

---

### TV3 — Đỗ Thái Dương — Architect · 5 SP · Task 1.4

**File:** `docs/design/architecture.md`, `docs/design/erd.md`, `packages/contracts/openapi.yaml`

**Giao 2 đợt:** openapi **v0** (auth + categories/brands) cuối D2; **v1** (listings) cuối D4.

```
PROMPT
Bạn là Software Architect. Đọc docs/design/state-machine.md và PROJECT PROPOSAL.md mục 4.

1. architecture.md: sơ đồ Mermaid Browser → React SPA (Vite :5173) → NestJS (:3000) → PostgreSQL (:5432);
   cấu trúc module; luồng xác thực (JWT trong httpOnly cookie, Vite proxy /api để same-origin);
   validation 2 lớp (zod FE + DTO BE); ghi rõ môi trường là LOCAL, không CI/CD.
2. erd.md: ERD Mermaid cho User, Category, Brand, Listing, PurchaseRequest, ExchangeOffer, Deal,
   DealItem, Report. Mỗi entity: cột, kiểu, null, unique, FK, index.
   BẮT BUỘC: thiết kế để 1 listing tối đa thuộc 1 deal hiệu lực (đề xuất partial unique index).
   Đặt tên bảng snake_case số nhiều; KHÔNG dùng bảng tên "transactions".
3. packages/contracts/openapi.yaml (3.1): đợt 1 auth + categories + brands; đợt 2 listings.
   Mỗi endpoint: request/response schema, error { code, message }, security scheme cookieAuth.

Ràng buộc: file single-writer. Mọi thay đổi contract phải thông báo cho nhóm.
```

---

### TV4 — Nguyễn Đức Nguyên — Platform + DB · 5 SP · Task 1.6, 1.7 (schema)

**File:** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/`, `docker-compose.yml`, `Makefile`, `AGENTS.md`, `.husky/`, `README.md`

**AC:** `make dev` chạy 1 lệnh · `make reset-db && make seed` có dữ liệu · `make check` < 60s · pre-commit chặn commit lỗi · unique index chặn double-booking **có test chứng minh** · README đủ để người ngoài chạy trên máy trắng.

```
PROMPT
Bạn là Platform + DB Engineer. Dự án chạy HOÀN TOÀN LOCAL, không CI/CD.

1. Dựng monorepo pnpm: apps/api (NestJS), apps/web (React + Vite), packages/contracts, docs/.
2. docker-compose.yml: CHỈ service postgres:16 (+ healthcheck), volume local, port 5432.
3. Makefile: dev, db:up, db:down, reset-db, seed, check, test:api. `make check` phải < 60 giây.
4. .husky/pre-commit chạy lint-staged + typecheck. Không dựng GitHub Actions.
5. prisma/schema.prisma theo ERD, ưu tiên bảng users trước để mở khoá auth.
6. Migration SQL tay cho ràng buộc cốt lõi:
   CREATE UNIQUE INDEX uniq_active_deal_item ON deal_items (listing_id)
     WHERE status IN ('CONFIRMED','IN_PROGRESS');
   Viết 1 integration test CHỨNG MINH index này chặn việc gán 2 deal hiệu lực cho cùng listing.
7. README.md: yêu cầu máy (Node 22, pnpm, Docker), các bước từ máy trắng đến `make dev`,
   xử lý lỗi thường gặp (port bận, docker chưa bật, seed lỗi).
8. .env.example + không commit .env; .nvmrc pin Node 22.

Ràng buộc: chỉ bạn sửa schema.prisma. Mục tiêu: một máy mới clone về không cần thao tác thủ công nào.
```

---

### TV7 — Vu Anh Duck — Seed + Listings BE · 6 SP · Task 1.7 (seed), 1.9 (BE)

**File:** `apps/api/prisma/seed.ts`, `apps/api/src/modules/listings/`

```
PROMPT
Bạn là backend dev (NestJS + Prisma). Đọc openapi.yaml, docs/design/state-machine.md, AGENTS.md.

Phần A — apps/api/prisma/seed.ts:
- 5 category (Điện thoại, Laptop, Máy tính bảng, Âm thanh, Phụ kiện), 8 brand.
- 3 user: 1 admin, 2 user thường (mật khẩu hash sẵn bằng argon2, ghi rõ trong README).
- 20-30 listing đa dạng danh mục/brand/tình trạng/giá; vài tin HIDDEN để test trạng thái.
- Idempotent: chạy lại không nhân đôi dữ liệu.

Phần B — module listings:
- POST /listings: cần đăng nhập; sellerId lấy từ JWT; status = APPROVED (TODO Sprint 4);
  validate tên 5-120, giá > 0, condition enum, categoryId/brandId tồn tại.
- GET /listings: chỉ APPROVED, phân trang page/limit, sort createdAt desc, trả meta.
- GET /listings/:id: 404 nếu không tồn tại, hoặc HIDDEN mà người xem không phải owner/admin.
- PATCH /listings/:id: chỉ owner (403); listing IN_DEAL → 409.
- POST /listings/:id/hide: soft hide, không xoá bản ghi.
- Kiểm ownership bằng guard/decorator, KHÔNG tin id từ client.

Test: tạo thành công; sửa tin người khác → 403; giá âm → 400; tin ẩn với user thường → 404.
Ràng buộc: không sửa schema.prisma; cần cột mới thì mở issue cho TV4.
```

---

### TV5 — Nguyễn Minh Việt — Auth BE + nền FE · 5.5 SP · Task 1.8 (BE), 1.11 (api client + MSW)

**File:** `apps/api/src/modules/auth/`, `apps/api/src/common/`, `apps/web/src/shared/api/`, `apps/web/src/mocks/`

```
PROMPT
Bạn là backend dev (NestJS + Prisma) kiêm dựng lớp gọi API cho frontend. Dự án chạy LOCAL.

Phần A — module auth:
- register: email unique, hash argon2id, role USER, trả 201 + user DTO (không có password).
- login: verify argon2, ký JWT (sub, role) hạn 7d, set httpOnly cookie (SameSite=Lax, Secure=false vì localhost).
- logout: clear cookie. me: trả user từ cookie.
- JwtAuthGuard, RolesGuard + @Roles('ADMIN'), @CurrentUser(). Deprioritize: merge guard sớm nhất có thể
  (D6) để TV7 làm ownership check.
- Lỗi chuẩn hoá qua ExceptionFilter: { code, message }. Rate limit login 5 lần/phút.
- Không log password/token.

Phần B — nền FE:
- apps/web/src/shared/api/: fetch wrapper dùng base '/api' (Vite proxy), credentials: 'include',
  tự parse { code, message }, không lưu token ở localStorage.
- apps/web/src/mocks/: MSW handler cho /auth/* và /listings theo đúng openapi.yaml, dữ liệu giả trong memory.
- Cấu hình Vite proxy /api → http://localhost:3000.

Test: register trùng email → 409; sai pass → 401; /auth/me không cookie → 401; route admin với USER → 403.
```

---

### TV6 — Phi Hoàng — Auth FE + Khung ứng dụng · 5.5 SP · Task 1.11 (shell), 1.8 (FE)

**File:** `apps/web/src/app/`, `apps/web/src/features/auth/`, `apps/web/src/shared/ui/`

```
PROMPT
Bạn là frontend dev (React + Vite + TS + Tailwind + shadcn/ui + TanStack Query + React Router).

Phần A — khung ứng dụng (làm trước, D2-D4):
- src/app/router.tsx: route công khai (/login, /register, /listings) và route bảo vệ (/my-listings, /admin).
- Layout: Header (logo, tên user, nút đăng nhập/đăng xuất), Footer, container responsive, ErrorBoundary,
  trang 404.
- shadcn/ui init + design token khớp wireframe của Vũ Tâm.
- ProtectedRoute + hook useCurrentUser().
- Pattern chuẩn cho loading / empty / error dùng chung (để TV8 và sau này tái sử dụng).

Phần B — auth FE:
- /register, /login: react-hook-form + zod; hiển thị lỗi server theo { code, message }; trạng thái loading;
  redirect sau khi thành công.
- Header phản ánh trạng thái đăng nhập.

Ràng buộc: KHÔNG lưu token vào localStorage; dùng api client của TV5 (không tự viết fetch riêng).
Không sửa apps/api, không sửa src/shared/api. Đây là "golden path" mẫu để cả nhóm copy style.
```

---

### TV8 — Vũ Tâm — Wireframe + Listings FE · 7 SP · Task 1.5, 1.9 (FE)

**File:** `docs/design/wireframes/`, `apps/web/src/features/listings/`

```
PROMPT
Bạn là frontend dev + UI/UX (React + Vite + TS + Tailwind + shadcn/ui + TanStack Query).

Phần A — docs/design/wireframes/: mô tả 4 màn hình (danh sách tin, chi tiết tin, đăng nhập/đăng ký,
tạo tin): mục đích, thành phần, hành động chính, trạng thái loading/empty/error, responsive.
Kèm design token (màu, typography, spacing) để Phi Hoàng dùng lại.

Phần B — features/listings:
- /listings: grid card (tên, giá VND, tình trạng, danh mục, brand), phân trang, empty state.
- /listings/:id: chi tiết + người bán + nút "Quan tâm" (disabled, Sprint 2 mới có).
- /listings/new: form tạo tin đủ field theo contract; submit → POST /listings → về /my-listings.
- /my-listings: bảng tin của tôi + ẩn tin.
- Dùng component/layout của TV6 và api client của TV5, KHÔNG tự dựng lại.

Ràng buộc: chạy trên MSW trước khi BE xong; không sửa apps/api, không sửa src/app.
DoD: mọi màn hình có 3 trạng thái loading/empty/error; không có `any`; build không warning.
```

---

## 5. CHECKLIST TRƯỚC DEMO (D13)

- [ ] Máy demo đã `git pull`, `make reset-db`, `make seed`, `make dev` → chạy được trong < 5 phút.
- [ ] `make check` xanh, `make test:api` xanh.
- [ ] Demo đúng luồng: đăng nhập → tạo tin → thấy trong danh sách → ẩn tin.
- [ ] Tài khoản demo: 1 admin + 2 user, mật khẩu ghi trong README.
- [ ] **Video demo dự phòng 3–5 phút** đã quay và lưu ở 2 nơi (máy + cloud).
- [ ] Slide có mục: kiến trúc local, ERD, state machine, kết quả test, việc còn lại.
- [ ] Backlog Sprint 2 đã cập nhật (thứ tự 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6).
