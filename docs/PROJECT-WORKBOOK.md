# SỔ TAY DỰ ÁN — ELECTRONICS TRADING & EXCHANGE MARKETPLACE
**Nhóm 5 · Học phần Nhập môn Công nghệ phần mềm · Phiên bản 1.0 (Sprint 1)**

> **File này dùng để làm gì:** đây là văn bản duy nhất cả nhóm đọc trước khi làm việc. Phần I là luật chung áp dụng cho **mọi sprint**. Phần III là hướng dẫn thực hiện chi tiết **11 đầu việc của Sprint 1**. Phần V là quy trình chạy hằng ngày.
> **Nguyên tắc sử dụng:** khi có mâu thuẫn giữa file này và tài liệu thiết kế chi tiết (do task 1.3, 1.4 sinh ra), **tài liệu thiết kế thắng** — vì đó là sản phẩm được review. Sổ tay chỉ đưa ra mức nền tối thiểu.

---

## MỤC LỤC

| Phần | Nội dung | Đọc khi |
|---|---|---|
| **I** | Quy định chung toàn dự án (12 điều) | Ngày đầu tiên, đọc hết |
| **II** | Kiến trúc & môi trường local | Trước khi code dòng đầu tiên |
| **III** | 11 đầu việc Sprint 1 — hướng dẫn chi tiết + prompt AI | Mỗi người đọc đúng mục của mình |
| **IV** | Phân công, lịch, điểm nghẽn | Cả nhóm |
| **V** | Quy trình làm việc hằng ngày | Dùng lại mỗi ngày |
| **VI** | Phụ lục: template, checklist, bảng mã lỗi | Khi mở PR / khi demo |

---

# PHẦN I — QUY ĐỊNH CHUNG

## Điều 1 — Phạm vi và giới hạn

**Sản phẩm là gì:** nền tảng web C2C cho phép người dùng đăng tin, mua bán và **trao đổi** thiết bị điện tử mới/đã qua sử dụng.

**Ba giới hạn không được vượt qua (đã ghi trong Proposal):**

| Không làm | Hệ quả với code |
|---|---|
| Thanh toán trực tuyến | Không có bảng `payments`, không gọi cổng thanh toán. Chỉ ghi nhận trạng thái giao dịch |
| Vận chuyển | Không có bảng `shipments`, không tích hợp đơn vị vận chuyển |
| Ký quỹ / tranh chấp tài chính | Không giữ tiền, không hoàn tiền |

**Bốn giới hạn riêng của phiên bản này:** chạy **local**, không deploy, không CI/CD, không HTTPS.

**Nguyên tắc khi phân vân một chức năng mới:** hỏi "chức năng này có nằm trong 8 mục In-Scope của Proposal không?" — không thì **ghi vào backlog, không tự làm**. Tự thêm scope là lỗi nghiêm trọng nhất của đồ án.

---

## Điều 2 — Vai trò (mũ) và nguyên tắc luân chuyển

| Mũ | Trách nhiệm chính | Số người |
|---|---|---|
| PM/BA | Chốt phạm vi, viết story + AC, giữ board, đầu mối nộp bài | 1 |
| SA (System Analyst) | State machine, quy tắc nghiệp vụ, ma trận test | 1 |
| Architect | ERD, kiến trúc, **người duy nhất sửa API contract** | 1 |
| Platform/DB | Repo, môi trường local, schema, migration | 1 |
| Backend dev | Module NestJS | 2 |
| Frontend dev | Module React | 2 |
| QA | Test case, chạy test, kịch bản demo | (gộp vào SA) |
| UI/UX | Wireframe, design token | (gộp vào FE) |

**Luật:** trong **một sprint, mũ cố định**. Đổi mũ chỉ ở sprint planning. Lý do: nếu ai cũng có thể sửa mọi file thì 8 AI agent sẽ ghi đè lên nhau.

---

## Điều 3 — Công nghệ đã chốt (không tự đổi)

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Ngôn ngữ | **TypeScript** toàn bộ FE + BE | `strict: true`, không `any` |
| Frontend | React 19 + Vite + Tailwind CSS + shadcn/ui + TanStack Query + React Router + react-hook-form + zod + MSW | MSW dùng để chạy FE trước khi có BE |
| Backend | NestJS + Prisma + PostgreSQL 16 | REST, Swagger tự sinh |
| Auth | JWT trong **httpOnly cookie** + argon2id + RBAC | **Cấm** lưu token vào localStorage |
| Test | Vitest (unit) + Supertest (API) + Playwright (E2E smoke) | Tối thiểu 2 E2E |
| Chạy local | Docker Compose **chỉ cho PostgreSQL**; api/web chạy `pnpm dev` | Node 22 LTS, pnpm 10 |

**Muốn đổi công nghệ?** Không được. Muốn thêm thư viện? Mở issue, PM duyệt, ghi vào `docs/design/architecture.md`.

---

## Điều 4 — Quy định mã nguồn

### 4.1 Đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Bảng DB | `snake_case`, số nhiều | `listings`, `deal_items` |
| Cột DB | `snake_case` | `created_at`, `seller_id` |
| Biến / hàm | `camelCase` | `getListingById()` |
| Component React | `PascalCase`, file `.tsx` | `ListingCard.tsx` |
| File khác | `kebab-case` | `listing-service.ts` |
| Hằng số | `UPPER_SNAKE` | `MAX_LISTING_IMAGES` |
| Enum giá trị | `UPPER_SNAKE` | `APPROVED`, `IN_DEAL` |
| Endpoint | danh từ số nhiều, `kebab-case` | `GET /api/listings` |

### 4.2 Ba điều cấm trong code

1. **Cấm `any`.** Cần kiểu chưa biết → `unknown` rồi narrow.
2. **Cấm bảng tên `transactions`** (trùng từ khoá SQL, Prisma/Nest hay sinh lỗi khó sửa). Dùng `deals`.
3. **Cấm gọi API trực tiếp bằng `fetch` trong component.** Mọi thứ đi qua `src/shared/api/`.

### 4.3 Cấu trúc thư mục (bắt buộc)

```
apps/
  api/src/modules/<feature>/     # mỗi feature = 1 module NestJS
  api/prisma/                    # schema + migrations + seed
  web/src/app/                   # router, layout, providers
  web/src/features/<feature>/    # UI theo tính năng
  web/src/shared/                # api client, ui components, utils
packages/contracts/              # openapi.yaml + type sinh ra
docs/                            # requirements, design, test, ai
```

### 4.4 Quy định Git

| Việc | Quy ước |
|---|---|
| Branch chính | `main` — **luôn chạy được** |
| Branch làm việc | `feat/<task-id>-<mô-tả>` — ví dụ `feat/1.8-auth-login` |
| Commit | `feat(listings): thêm API tạo tin [1.9]` · `fix(auth): sửa lỗi cookie không set [1.8]` · `docs(design): ERD v1 [1.4]` |
| PR | ≤ 400 dòng đổi, tiêu đề có Task ID, bắt buộc 1 reviewer **khác stream** |
| Merge | Squash merge, xoá branch sau khi merge |
| Rebase | Chỉ rebase trên nhánh của mình. **Cấm** force-push lên `main` |

---

## Điều 5 — Định nghĩa "xong" (Definition of Done)

Một đầu việc chỉ được coi là xong khi **tất cả** ô sau đều đạt:

- [ ] Acceptance criteria của task đạt 100%
- [ ] `make check` xanh (lint + typecheck + unit test), chạy dưới 60 giây
- [ ] Có test cho happy path **và** ít nhất 1 case lỗi
- [ ] Không có `any`, không `console.log` sót lại
- [ ] Đã chạy thử luồng thật trên môi trường local (không chỉ tin vào test)
- [ ] PR đã được 1 người khác stream review
- [ ] Prompt AI đã lưu vào `docs/ai/prompts/<task-id>.md`
- [ ] Tài liệu liên quan đã cập nhật (contract/ERD/README nếu có thay đổi)

**Định nghĩa "sẵn sàng để làm" (Definition of Ready):** task phải có sẵn → người chịu trách nhiệm, đầu ra cụ thể, AC kiểm chứng được, và phụ thuộc đã xong. Task thiếu 1 trong 4 → **không bắt đầu**, báo PM.

---

## Điều 6 — Quy định bảo mật tối thiểu

Đây là các lỗi AI **hay sinh ra nhất**; kiểm tra thủ công từng dòng:

| # | Luật | Lỗi AI hay mắc |
|---|---|---|
| 1 | JWT chỉ trong **httpOnly cookie** | Hay viết `localStorage.setItem('token', ...)` |
| 2 | Không trả `password` / `passwordHash` trong bất kỳ response nào | Hay trả nguyên object user từ Prisma |
| 3 | Mọi route sửa/xoá phải kiểm tra **ownership**, không tin `id` từ client | Hay nhận `sellerId` từ body |
| 4 | Mọi route admin phải có `@Roles('ADMIN')` | Hay chỉ ẩn nút ở FE |
| 5 | Không log mật khẩu, token, cookie | Hay `console.log(req.body)` |
| 6 | Validate ở **BE**, không chỉ FE | Hay chỉ dùng zod ở FE |
| 7 | Không commit `.env`, khoá bí mật | Hay hardcode `JWT_SECRET` |

---

## Điều 7 — Quy định dùng AI (áp dụng cho cả 8 người)

### 7.1 AI được làm gì, không được làm gì

| AI **được** làm | AI **không được** làm |
|---|---|
| Sinh code theo task card có sẵn | Tự quyết định thay đổi phạm vi / thêm chức năng |
| Sinh test từ acceptance criteria | Sửa `schema.prisma`, `openapi.yaml`, hay file của người khác |
| Sinh tài liệu từ template | Tự thêm dependency mới |
| Review code của chính mình (vai đối kháng) | Merge PR thay người |
| Gợi ý refactor | Tự "dọn dẹp" file ngoài phạm vi task |

### 7.2 Quy trình 5 bước bắt buộc

```
1. VIẾT TASK CARD  → người làm tự viết, dựa trên mục III của sổ tay này
2. PROMPT AI       → dán theo mẫu 7 phần (7.3)
3. AI IMPLEMENT    → một hội thoại/context riêng cho một task
4. REVIEW 2 LỚP    → (a) agent khác review đối kháng  (b) người review PR
5. LƯU VẾT         → prompt + kết quả review vào docs/ai/prompts/
```

### 7.3 Mẫu prompt 7 phần (dùng cho mọi task)

```
[1] VAI TRÒ     Bạn là <backend dev / frontend dev / ...> của dự án <tên>.
[2] BỐI CẢNH    Đọc trước: <danh sách file cụ thể>. Dự án chạy local, không CI/CD.
[3] NHIỆM VỤ    <1 câu, kèm danh sách việc con đánh số>
[4] RÀNG BUỘC   File được sửa: <danh sách chính xác>. Không sửa ngoài danh sách.
                Không đổi schema/contract. Không thêm dependency.
[5] TIÊU CHÍ    <3-6 AC kiểm chứng được, copy từ task card>
[6] KIỂM CHỨNG   Chạy `make check` và <lệnh test cụ thể>; báo lại kết quả.
[7] ĐẦU RA       Danh sách file đã tạo/sửa + tóm tắt thay đổi + điều còn TODO.
```

**Ba lỗi prompt thường gặp:**
- **Prompt quá ngắn** ("làm trang đăng nhập đi") → AI tự bịa field, tự bịa API.
- **Prompt thiếu ràng buộc file** → AI refactor lung tung, PR 900 dòng, conflict.
- **Prompt thiếu tiêu chí kiểm chứng** → không biết khi nào dừng, AI "làm thêm cho đẹp".

### 7.4 Review đối kháng — prompt cố định

Sau khi AI viết xong code, mở **một context mới** và dán prompt sau (đây là bước hay bị bỏ qua nhất):

```
Bạn là reviewer khó tính. Dưới đây là PR cho task <ID> của dự án <tên>.

Hãy tìm LỖI, không khen. Kiểm tra theo thứ tự:
1. File bị sửa có nằm ngoài phạm vi task không?
2. Có vi phạm 7 luật bảo mật (Điều 6) không? Đặc biệt: quyền sở hữu dữ liệu, role admin,
   token trong localStorage, lộ password.
3. Acceptance criteria nào CHƯA được đáp ứng? Trích dẫn dòng code chứng minh.
4. Case biên nào chưa xử lý? (null, rỗng, trùng, số âm, id không tồn tại, người dùng khác sở hữu)
5. Có chỗ nào bắt buộc dùng `any` hoặc bỏ qua type không?
6. Test đang test đúng thứ cần test, hay chỉ test cho có?

Xuất ra bảng: Mức độ (Blocker/Major/Minor) | Vị trí | Vấn đề | Cách sửa.
Nếu không tìm được lỗi nào ở một mục, ghi rõ "đã kiểm, không phát hiện".
```

### 7.5 Lưu vết AI

Mỗi task tạo một file `docs/ai/prompts/<task-id>.md`:

```markdown
# Task 1.8 — Prompt log
## Prompt đã dùng
<dán prompt>
## Kết quả review đối kháng
<trích các lỗi tìm được + đã sửa chưa>
## Ghi chú
- AI đề xuất thêm <X> nhưng không dùng vì ngoài scope.
```

**Vì sao vẫn phải làm dù giảng viên cho dùng AI thoải mái:** đây là bằng chứng quy trình khi bị hỏi "ai làm gì, làm thế nào". Nộp kèm báo cáo là điểm cộng, không phải nghĩa vụ nặng.

### 7.6 `AGENTS.md` — file luật cho mọi AI agent

Đặt ở thư mục gốc repo, task 1.6 tạo ra:

```markdown
# AGENTS.md
## Trước khi code
- Đọc docs/design/state-machine.md và packages/contracts/openapi.yaml.
- Không sửa file ngoài danh sách trong task card của bạn.

## Lệnh
- make dev / make check / make test:api / make reset-db

## Quy ước
- TypeScript strict, không `any`.
- Mọi API mới: cập nhật openapi.yaml TRƯỚC (do Architect làm), rồi mới code.
- Không sửa apps/api/prisma/schema.prisma (chỉ DB owner) và packages/contracts (chỉ Architect).
- Không thêm dependency nếu chưa được duyệt.

## Bảo mật
- Không lưu token vào localStorage. Không log mật khẩu/token.
- Mọi route bảo vệ phải có guard + kiểm tra ownership.

## Định nghĩa xong
- Có test happy path + 1 case lỗi. `make check` xanh. PR ≤ 400 dòng.
```

---

## Điều 8 — Phối hợp giữa 8 người

| Luật | Nội dung |
|---|---|
| **File ownership** | Mỗi người chỉ sửa vùng file của mình (bảng ở Phần IV). Muốn sửa vùng khác → nhắn trong kênh chung trước |
| **Single-writer** | `schema.prisma` → chỉ Nguyễn Đức Nguyên. `openapi.yaml` → chỉ Đỗ Thái Dương. `Makefile`/`docker-compose.yml` → chỉ Nguyễn Đức Nguyên |
| **Contract-first** | Không ai code API trước khi có openapi cho endpoint đó; không ai code FE gọi API trước khi có contract |
| **PR cross-review** | Reviewer phải ở stream khác. Không ai tự merge PR của mình |
| **Bị chặn > 2 giờ** | Báo ngay trong kênh chung, không tự "làm tạm" rồi sửa sau |
| **Sửa file dùng chung** | `src/shared/`, `src/app/` → thông báo 1 câu trước khi merge, vì 4-5 người import từ đó |

---

## Điều 9 — Quy định về test

| Loại | Công cụ | Bắt buộc cho |
|---|---|---|
| Unit | Vitest | Hàm xử lý logic, component có điều kiện |
| API integration | Supertest + DB thật (docker) | Mọi endpoint mới |
| E2E smoke | Playwright | 2 luồng: đăng nhập, tạo tin đăng |

**Luật:** không có test thì không merge. Test phải chạy **offline** (không gọi internet), dùng DB local riêng, dọn dữ liệu sau mỗi test.

---

## Điều 10 — Quy định tài liệu

| Tài liệu | File | Ai cập nhật |
|---|---|---|
| SRS | `docs/srs/` | PM/BA (+ review cả nhóm) |
| State machine | `docs/design/state-machine.md` | SA |
| ERD + kiến trúc | `docs/design/erd.md`, `architecture.md` | Architect |
| API contract | `packages/contracts/openapi.yaml` | Architect |
| Test case + báo cáo | `docs/test/` | QA |
| README chạy dự án | `README.md` | Platform |
| Prompt log | `docs/ai/prompts/` | Từng người |

**Luật vàng:** tài liệu cập nhật **cùng lúc** với code, không để cuối sprint. Cuối sprint mới viết SRS là nguyên nhân phổ biến khiến đồ án mất điểm.

---

## Điều 11 — Ba điều cấm tuyệt đối

1. **Cấm commit `.env`** hoặc bất kỳ khoá bí mật nào.
2. **Cấm push trực tiếp lên `main`** khi `main` không chạy được.
3. **Cấm tự mở rộng phạm vi** (thêm chức năng không có trong Proposal hoặc sprint backlog).

---

## Điều 12 — Kênh liên lạc

- **Kênh chung:** mọi thông báo đổi contract, đổi schema, đổi cấu trúc file.
- **Daily:** 15 phút, mỗi người trả lời 3 câu: hôm qua làm gì · hôm nay làm gì · đang bị chặn gì.
- **Quy tắc vàng:** bị chặn thì nói ngay, không im lặng làm lại từ đầu.

---

# PHẦN II — KIẾN TRÚC & MÔI TRƯỜNG LOCAL

## 2.1 Kiến trúc

```
┌─────────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│  React SPA (Vite)   │  /api  │   NestJS REST API    │ Prisma │  PostgreSQL 16   │
│  localhost:5173     │ ─────► │   localhost:3000     │ ─────► │  docker :5432    │
│  shadcn/ui          │ proxy  │   JWT httpOnly cookie│        │  DB: marketplace │
└─────────────────────┘        └──────────────────────┘        └──────────────────┘
```

**Vì sao dùng Vite proxy:** FE và BE chạy khác port → cookie `httpOnly` bị coi là cross-origin, trình duyệt chặn. Proxy `/api` làm 2 ứng dụng **same-origin** dưới `localhost:5173`, xử lý luôn CORS. Đây là lỗi khiến rất nhiều nhóm mất nửa ngày.

## 2.2 Port và biến môi trường

| Thành phần | Cổng | Ghi chú |
|---|---|---|
| Web (Vite) | 5173 | `pnpm --filter web dev` |
| API (NestJS) | 3000 | `pnpm --filter api dev` |
| PostgreSQL | 5432 | chỉ chạy qua Docker |

`.env.example` (commit vào repo, không có giá trị thật):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace?schema=public"
JWT_SECRET="dev-secret-doi-khi-chay-local"
JWT_EXPIRES_IN="7d"
API_PORT=3000
VITE_API_BASE="/api"
```

## 2.3 Lệnh chuẩn

```bash
make dev        # bật postgres + chạy api & web
make db:up      # chỉ bật postgres
make reset-db   # xoá DB + migrate + seed  (dùng khi dữ liệu rối)
make seed       # nạp dữ liệu mẫu (idempotent)
make check      # lint + typecheck + unit test (< 60s) — chạy trước MỌI commit
make test:api   # integration test (cần db:up)
make e2e        # playwright (cần dev đang chạy)
```

## 2.4 Sự cố thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `ECONNREFUSED 5432` | Postgres chưa bật | `make db:up` |
| Cookie không được set | Thiếu `credentials: 'include'` ở FE hoặc thiếu Vite proxy | Kiểm tra `shared/api/` và `vite.config.ts` |
| 401 ngay sau khi login | `SameSite`/`path` của cookie sai | Cookie phải `path=/`, `SameSite=Lax` |
| Prisma "table does not exist" | Chưa migrate | `make reset-db` |
| Port bị chiếm | Tiến trình cũ còn chạy | Tắt tiến trình hoặc đổi port trong `.env` |
| Dữ liệu seed bị nhân đôi | Seed không idempotent | Dùng `upsert` thay vì `create` |

---

# PHẦN III — SPRINT 1: 11 ĐẦU VIỆC CHI TIẾT

**Mục tiêu Sprint 1:** có một bản chạy local, demo được **đăng nhập + tạo tin đăng + xem danh sách**, cùng bộ tài liệu nền (state machine, ERD, contract).

**Phân bố:** Analysis 11 SP · Design 8 SP · Development 23 SP · Testing 3 SP = **48 SP**

Mỗi task dưới đây gồm: người làm · phụ thuộc · các bước thực hiện · sản phẩm · AC · hướng dẫn cho AI · cách tự kiểm tra.

---

## TASK 1.6 — Thiết lập repository và môi trường local
**Người:** Nguyễn Đức Nguyên · **2 SP** · **Làm đầu tiên, ngay D1** · **Chặn:** toàn bộ code

**Các bước thực hiện**
1. Tạo repo GitHub (private) + `main` trống có README.
2. `pnpm init` + `pnpm-workspace.yaml` khai báo `apps/*`, `packages/*`.
3. Tạo `apps/api` (NestJS), `apps/web` (Vite React TS), `packages/contracts`, `docs/`.
4. `docker-compose.yml` chỉ có service `postgres:16` + healthcheck.
5. Viết `Makefile` với 7 target ở mục 2.3.
6. `AGENTS.md` (nội dung 7.6) + `.env.example` + `.gitignore` + `.nvmrc` (22).
7. Husky + lint-staged: pre-commit chạy `make check`.
8. README: từ máy trắng → `git clone` → `make dev` chạy được, kèm mục "sự cố thường gặp".
9. Merge, sau đó báo cả nhóm "repo đã sẵn sàng".

**Sản phẩm:** repo chạy được bằng 1 lệnh trên máy bất kỳ.
**AC:** `make dev` lên được API + web + DB · `make check` < 60s · pre-commit chặn commit có lỗi typecheck · README đủ để người ngoài làm theo.

**Hướng dẫn cho AI**
```
Bạn là Platform Engineer. Dự án TypeScript monorepo chạy HOÀN TOÀN LOCAL.

Tạo:
1. pnpm-workspace.yaml cho apps/* và packages/*.
2. apps/api: NestJS (pnpm dlx @nestjs/cli new) — bật strict TS, prettier, eslint.
3. apps/web: Vite + React + TS + Tailwind + shadcn/ui init.
4. docker-compose.yml: chỉ postgres:16, healthcheck pg_isready, volume, port 5432.
5. Makefile: dev, db:up, db:down, reset-db, seed, check, test:api, e2e.
   `make check` phải chạy lint + typecheck + unit test và xong dưới 60 giây.
6. .husky/pre-commit chạy lint-staged + typecheck cho file đã stage.
7. AGENTS.md, .env.example, .nvmrc, .gitignore, README.md (hướng dẫn máy trắng + sự cố thường gặp).

Không dựng GitHub Actions. Không cấu hình deploy. Không thêm Docker cho api/web.
Kiểm chứng: liệt kê lệnh đã chạy và kết quả.
```

**Tự kiểm tra:** xoá `node_modules` + DB volume, chạy lại `make dev` — phải chạy.

---

## TASK 1.1 — Phân tích yêu cầu và xác định MVP
**Người:** Gia Khanh Pham + cả nhóm · **5 SP** · **Ngay D1**

**Các bước thực hiện**
1. Họp 30 phút, đọc lại Proposal mục 3 (In/Out of Scope).
2. Lập bảng 3 cột: **Làm ở Sprint 1 / Làm sprint sau / Không làm bao giờ**.
3. Chốt 2 quyết định kỹ thuật-nghiệp vụ còn treo:
   - Tin đăng tạo ra **hiển thị ngay** với `status = APPROVED` (vì kiểm duyệt là Sprint 4) — nhưng cột `status` có sẵn từ đầu.
   - **Không làm upload ảnh** trong Sprint 1 (Proposal có nhắc ảnh → ghi rõ là lùi Sprint 4).
4. Ghi rõ mục "Hạ tầng": chạy local, không CI/CD, không deploy, không HTTPS.
5. Cả nhóm ký nhận (comment "đã đọc" trong PR).

**Sản phẩm:** `docs/requirements/mvp-scope.md`
**AC:** có danh sách "không làm" tường minh · 2 quyết định trên được ghi thành văn · không còn câu hỏi mở nào về phạm vi Sprint 1.

**Hướng dẫn cho AI**
```
Bạn là BA/PM. Đọc PROJECT PROPOSAL.md mục 3, 4, 5.

Viết docs/requirements/mvp-scope.md gồm:
(a) Mục tiêu Sprint 1 (1 đoạn);
(b) IN-SCOPE: bảng Task ID | Chức năng | Người dùng thấy gì;
(c) OUT-OF-SCOPE: bảng Chức năng | Lý do | Sprint dự kiến — bắt buộc có: tìm kiếm/lọc,
    trao đổi, kiểm duyệt, báo cáo vi phạm, upload ảnh, thanh toán, vận chuyển, đánh giá/rating, chat;
(d) Hạ tầng: local-only, PostgreSQL qua Docker, không CI/CD, không deploy, không HTTPS;
(e) 2 quyết định đã chốt ở trên, mỗi quyết định ghi rõ "vì sao" và "hệ quả lên thiết kế DB";
(f) Rủi ro nhận diện được + cách xử lý.

Không đề xuất thêm chức năng. Không viết code.
```

---

## TASK 1.2 — Viết user story và tiêu chí chấp nhận
**Người:** Gia Khanh Pham · **3 SP** · sau 1.1 nửa ngày · **Chặn:** 1.10

**Các bước thực hiện**
1. Lấy 6 chức năng trong phạm vi Sprint 1.
2. Viết theo mẫu `As a… I want… so that…`.
3. Mỗi story 3–5 AC dạng **Given–When–Then**.
4. Mỗi AC ghi rõ "kiểm chứng bằng test case nào" (để 1.10 dùng lại).
5. Gắn endpoint tương ứng trong contract (chưa có thì ghi TBD, task 1.4 sẽ điền).

**Sản phẩm:** `docs/requirements/user-stories.md`
**AC:** 6 story · mỗi story có AC kiểm chứng được · AC nào không viết được thành test thì phải viết lại.

**Hướng dẫn cho AI**
```
Bạn là BA. Viết 6 user story cho Sprint 1 của sàn mua bán thiết bị điện tử:
US-01 đăng ký, US-02 đăng nhập, US-03 xem danh sách tin, US-04 tạo tin đăng,
US-05 xem tin của tôi, US-06 chỉ admin vào được khu vực quản trị.

Mỗi story: ID, ưu tiên, "As a… I want… so that…", 3-5 AC dạng Given-When-Then,
endpoint dự kiến, và cột "test case tương ứng" (đặt mã TC-xx).
Ràng buộc: chỉ dùng chức năng trong docs/requirements/mvp-scope.md.
AC phải đo được: không viết "giao diện đẹp", phải viết "hiển thị lỗi dưới ô mật khẩu".
```

---

## TASK 1.3 — State machine và quy tắc trạng thái ⚠️ AT RISK
**Người:** Nguyễn Đăng Minh (chủ trì) + Đỗ Thái Dương (review ngay khi có nháp) · **3 SP** · sau 1.1 · **Chặn:** 1.4, 1.7, 1.8, 1.9

**Vì sao nguy hiểm:** đây là task duy nhất mà nếu sai thì cả 4 stream còn lại phải làm lại. CSV đã đánh AT RISK.

**Các bước thực hiện**
1. Liệt kê 5 entity có trạng thái: `Listing`, `PurchaseRequest`, `ExchangeOffer`, `Deal` (và `Report`).
2. Với mỗi entity: định nghĩa enum trạng thái (UPPER_SNAKE).
3. Lập bảng transition đầy đủ: **từ → sự kiện → điều kiện → đích → ai được làm**.
4. Viết danh sách **invariant** (bất biến) — những điều không bao giờ được sai.
5. Vẽ sơ đồ Mermaid cho `Listing` và `Deal`.
6. Ghi rõ trạng thái nào **chưa dùng ở Sprint 1** nhưng vẫn phải có trong schema.
7. Gửi bản nháp cho Đỗ Thái Dương sau 4 giờ để bắt đầu 1.4 (không chờ bản cuối).

**Mức nền tối thiểu (1.3 được phép sửa/thay thế, nhưng phải giữ các invariant):**

| Entity | Trạng thái |
|---|---|
| `Listing` | `PENDING` · `APPROVED` · `REJECTED` · `HIDDEN` · `IN_DEAL` · `SOLD` |
| `PurchaseRequest` | `PENDING` · `ACCEPTED` · `REJECTED` · `CANCELLED` · `COMPLETED` |
| `ExchangeOffer` | `PENDING` · `ACCEPTED` · `REJECTED` · `CANCELLED` · `COMPLETED` |
| `Deal` | `CONFIRMED` · `IN_PROGRESS` · `COMPLETED` · `CANCELLED` |

**Invariant bắt buộc:**
- INV-1: một listing chỉ thuộc tối đa **1 deal** ở `CONFIRMED`/`IN_PROGRESS`.
- INV-2: không ai gửi `ExchangeOffer` trên listing của chính mình.
- INV-3: chỉ listing `APPROVED` + khả dụng mới mua/trao đổi được.
- INV-4: offer bị `REJECTED`/`CANCELLED` → cả hai listing trở lại khả dụng.
- INV-5: sửa listing đã `APPROVED` → quay về `PENDING` (chống bypass kiểm duyệt).
- INV-6: chỉ `ADMIN` được `APPROVE`/`REJECT` listing và xử lý `Report`.
- INV-7: một deal `COMPLETED` thì các listing liên quan chuyển `SOLD`, không mở lại.

**Hướng dẫn cho AI**
```
Bạn là System Analyst. Đọc PROJECT PROPOSAL.md mục 2, 4, 5 (Workflow 3 "Quy tắc cơ bản").

Viết docs/design/state-machine.md cho Listing, PurchaseRequest, ExchangeOffer, Deal, gồm:
(a) enum trạng thái + mô tả tiếng Việt;
(b) bảng transition: từ → sự kiện → điều kiện tiên quyết → đích → actor;
(c) INVARIANT, tối thiểu 7 điều (dùng danh sách INV-1..INV-7 trong sổ tay dự án);
(d) Mermaid stateDiagram-v2 cho Listing và Deal;
(e) bảng "trạng thái nào chưa dùng ở Sprint 1 và vì sao vẫn phải có trong schema".

Ràng buộc: không viết code. Mọi transition phải trả lời được "ai bấm nút này".
Nếu một transition không có actor rõ ràng, ghi "CẦN CHỐT" thay vì tự suy đoán.
```

**Tự kiểm tra:** đọc từng dòng transition, hỏi "nếu user A bấm nút này lúc tin đang IN_DEAL thì sao?" — phải có câu trả lời.

---

## TASK 1.4 — ERD, kiến trúc và API contract ⚠️ AT RISK
**Người:** Đỗ Thái Dương · **5 SP** · sau **bản nháp** 1.3 · **Chặn:** 1.7

**Các bước thực hiện**
1. Từ 1.3 + 1.1, vẽ ERD đủ 9 bảng.
2. Mỗi bảng: cột, kiểu, null, unique, FK, index.
3. Thiết kế **`deals` + `deal_items`** phục vụ cả mua bán (1 item) và trao đổi (2 item) — đây là quyết định kiến trúc quan trọng nhất của dự án.
4. Viết `architecture.md` (sơ đồ + quyết định xác thực + validation 2 lớp).
5. Viết `openapi.yaml` **v0** (auth + categories + brands) cuối D2 → thông báo nhóm.
6. Viết **v1** (listings) cuối D4.
7. Hướng dẫn nhóm chạy `pnpm gen:api` để sinh type.

**Sản phẩm:** `docs/design/architecture.md`, `docs/design/erd.md`, `packages/contracts/openapi.yaml`

| Bảng | Vai trò |
|---|---|
| `users` | Tài khoản, role `USER`/`ADMIN` |
| `categories`, `brands` | Danh mục, thương hiệu |
| `listings` | Tin đăng, có `seller_id`, `status`, `accepts_exchange` |
| `purchase_requests` | Yêu cầu mua |
| `exchange_offers` | Đề nghị trao đổi (listing A đổi listing B) |
| `deals`, `deal_items` | Giao dịch + các thiết bị tham gia (1 hoặc 2) |
| `reports` | Báo cáo vi phạm |

**Hướng dẫn cho AI**
```
Bạn là Software Architect. Đọc docs/design/state-machine.md.

1. docs/design/architecture.md: Mermaid Browser(5173) → NestJS(3000) → PostgreSQL(5432);
   module backend; luồng xác thực (JWT httpOnly cookie + Vite proxy /api); validation 2 lớp
   (zod FE + DTO BE); ghi rõ môi trường LOCAL, không CI/CD.
2. docs/design/erd.md: ERD Mermaid cho 9 bảng trên.
   Mỗi bảng: cột, kiểu, null, unique, FK, index. Nêu rõ quan hệ và cardinality.
   BẮT BUỘC: giải thích cách đảm bảo INV-1 (1 listing tối đa 1 deal hiệu lực)
   bằng ràng buộc CSDL, không chỉ bằng code. Gợi ý partial unique index trên deal_items.
   Không đặt tên bảng "transactions"; dùng "deals".
3. packages/contracts/openapi.yaml (OpenAPI 3.1):
   - Đợt 1 (làm trước): /auth/register, /auth/login, /auth/logout, /auth/me,
     /categories, /brands.
   - Đợt 2: /listings (list, detail, create, update, hide).
   Mỗi endpoint: request schema, response schema, error { code, message }, security cookieAuth.
   Mã lỗi dùng đúng bảng mã lỗi ở Phần VI.

Ràng buộc: file single-writer. Mọi thay đổi contract phải thông báo trong kênh chung.
```

---

## TASK 1.5 — Wireframe và design token
**Người:** Vũ Tâm · **3 SP** · D1 (song song 1.1) · **Chặn:** 1.11, phần FE của 1.8/1.9

**Các bước thực hiện**
1. Vẽ 4 màn hình: danh sách tin · chi tiết tin · đăng nhập/đăng ký · tạo tin đăng.
2. Mỗi màn hình ghi: mục đích, thành phần, hành động chính, **3 trạng thái** (loading / rỗng / lỗi), responsive.
3. Chốt design token: màu chính/phụ/ngữ nghĩa, typography, spacing scale, bo góc, shadow.
4. Chỉ rõ component nào dùng shadcn/ui có sẵn, component nào phải tự viết.
5. Bàn giao cho Phi Hoàng (1.11) và dùng lại cho phần FE 1.9.

**Sản phẩm:** `docs/design/wireframes/` (mô tả + ASCII/Figma + token)
**AC:** 4 màn hình · mỗi màn hình có 3 trạng thái · token khớp với shadcn/ui · Phi Hoàng đọc là dựng được, không cần hỏi lại.

**Hướng dẫn cho AI**
```
Bạn là UI/UX designer kiêm frontend dev. Hệ thống dùng shadcn/ui + Tailwind.

Tạo docs/design/wireframes/ gồm:
(a) 4 file mô tả màn hình (markdown + ASCII layout): mục đích, thành phần theo thứ tự trên xuống,
    hành động chính, trạng thái loading/empty/error, responsive mobile & desktop;
(b) design-tokens.md: bảng màu (primary/secondary/success/warning/danger/neutral), font size scale,
    spacing scale, radius, shadow — định dạng Tailwind;
(c) components.md: danh sách component cần có, cái nào dùng shadcn/ui sẵn, cái nào tự viết
    (MoneyText, ConditionBadge, ListingCard, Pagination, EmptyState).

Ràng buộc: chỉ 4 màn hình trong phạm vi Sprint 1. Không thiết kế trang quản trị.
Không dùng màu/typography ngoài bảng token.
```

---

## TASK 1.7 — Schema CSDL và dữ liệu mẫu
**Người:** Nguyễn Đức Nguyên (schema, 3 SP) + Vu Anh Duck (seed, 2 SP) · **5 SP** · sau 1.4 · **Chặn:** 1.8, 1.9

**Các bước thực hiện**
1. Viết `schema.prisma` theo ERD — **ưu tiên bảng `users` trước** (D4), phần còn lại D5.
2. Chạy `prisma migrate dev` sinh migration.
3. **Viết migration SQL tay** thêm ràng buộc mà Prisma không hỗ trợ:

```sql
-- INV-1: một listing chỉ thuộc tối đa 1 deal đang hiệu lực
CREATE UNIQUE INDEX uniq_active_deal_item
  ON deal_items (listing_id)
  WHERE status IN ('CONFIRMED', 'IN_PROGRESS');
```

4. Viết `seed.ts`: 5 category, 8 brand, 3 user (1 admin), 20–30 listing đa dạng. Dùng `upsert` để **idempotent**.
5. Viết 1 integration test **chứng minh** index chặn được việc gán 2 deal hiệu lực cho cùng listing.
6. Chạy `make reset-db && make seed` xác nhận sạch.

**AC:** reset DB 1 lệnh · seed chạy lại không nhân đôi · test chứng minh ràng buộc INV-1 pass · không có bảng tên `transactions`.

**Hướng dẫn cho AI**
```
Bạn là DB Engineer (Prisma + PostgreSQL). Đọc docs/design/erd.md.

1. Viết apps/api/prisma/schema.prisma đúng ERD: model User, Category, Brand, Listing,
   PurchaseRequest, ExchangeOffer, Deal, DealItem, Report. Dùng enum cho mọi trạng thái.
   Thêm createdAt/updatedAt cho mọi bảng, index cho các cột hay lọc (status, categoryId, brandId).
2. Tạo migration. Sau đó thêm migration SQL tay cho partial unique index chặn INV-1.
3. Viết seed.ts idempotent (upsert): 5 categories, 8 brands, 1 admin + 2 user
   (mật khẩu hash argon2, ghi mật khẩu gốc vào README), 20-30 listings với giá/tình trạng đa dạng,
   vài tin HIDDEN.
4. Viết test integration: tạo 2 Deal cho cùng 1 listing ở trạng thái CONFIRMED → phải bị chặn ở DB
   (không chỉ bị chặn ở service). Báo lỗi nếu chặn không xảy ra.

Ràng buộc: chỉ bạn được sửa schema.prisma. Không dùng tên bảng "transactions".
Với mỗi quyết định thiết kế, ghi 1 dòng comment giải thích.
```

---

## TASK 1.11 — Khung ứng dụng frontend dùng chung 🆕
**Người:** Phi Hoàng (shell/layout, 1.5) + Nguyễn Minh Việt (api client + MSW, 1.5) · **3 SP** · D2–D4

**Vì sao có task này:** nếu không có, Phi Hoàng và Vũ Tâm sẽ tự dựng 2 bộ layout/api client/xử lý lỗi → trùng lặp, không ai dám sửa về sau.

**Các bước thực hiện**
1. (Minh Việt) `shared/api/client.ts`: fetch wrapper, base `/api`, `credentials: 'include'`, parse `{ code, message }`, ném lỗi chuẩn hoá.
2. (Minh Việt) MSW handlers cho `/auth/*`, `/listings` theo đúng contract.
3. (Phi Hoàng) Router: route công khai + route bảo vệ, trang 404.
4. (Phi Hoàng) Layout: Header (logo, tên user, nút đăng nhập/đăng xuất), Footer, container responsive, ErrorBoundary.
5. (Phi Hoàng) shadcn/ui init + token khớp wireframe 1.5.
6. Component dùng chung: `PageLoader`, `EmptyState`, `ErrorState` — dùng lại cho mọi màn hình.
7. Thông báo nhóm: "khung đã sẵn sàng, ai cần gì thêm thì báo".

**AC:** `pnpm --filter web dev` lên được trang trống có header/footer · MSW bật/tắt bằng biến môi trường · 401 từ API hiển thị thông báo thống nhất.

**Hướng dẫn cho AI**
```
Bạn là frontend dev. React + Vite + TS + Tailwind + shadcn/ui + TanStack Query + React Router.

Phần A — api client (apps/web/src/shared/api):
- client.ts: fetch wrapper dùng base '/api' (Vite proxy), credentials: 'include',
  đọc JSON, nếu !res.ok thì ném ApiError { code, message, status }.
- queryClient.ts: cấu hình TanStack Query, retry 0 với lỗi 4xx.

Phần B — MSW (apps/web/src/mocks):
- handler cho /auth/register, /auth/login, /auth/me, /listings theo đúng openapi.yaml.
- bật/tắt qua VITE_USE_MOCK.

Phần C — shell (apps/web/src/app):
- router.tsx: public (/login, /register, /listings) + protected (/my-listings, /admin) + 404.
- Layout.tsx + Header.tsx (logo, tên user, đăng nhập/đăng xuất) + Footer.tsx.
- ErrorBoundary, PageLoader, EmptyState, ErrorState.
- shadcn/ui init, CSS variable theo docs/design/wireframes/design-tokens.md.

Ràng buộc: không sửa apps/api; không tự viết fetch ở component khác;
không lưu token ở localStorage (cookie do server set).
```

---

## TASK 1.8 — Đăng ký, đăng nhập và phân quyền
**Người:** Nguyễn Minh Việt (BE, 4 SP) + Phi Hoàng (FE, 4 SP) · **8 SP** · sau bảng `users` + openapi v0

**Các bước thực hiện**

*Backend (Minh Việt)*
1. Module `auth`: register (hash argon2id, role mặc định `USER`).
2. login: verify → ký JWT → set `httpOnly` cookie (`SameSite=Lax`, `Secure=false` vì localhost).
3. logout (clear cookie), me (đọc cookie).
4. `JwtAuthGuard`, `RolesGuard`, `@Roles('ADMIN')`, `@CurrentUser()`.
5. **Ưu tiên merge guard trước D6** — để Anh Duck làm được kiểm ownership ở 1.9.
6. ExceptionFilter trả `{ code, message }`; rate limit login 5 lần/phút.

*Frontend (Phi Hoàng)*
7. `/login`, `/register`: react-hook-form + zod, hiển thị lỗi theo `code`.
8. `ProtectedRoute`, `useCurrentUser()`, header phản ánh trạng thái đăng nhập.

**AC:** đăng ký → đăng nhập → `/auth/me` trả đúng user · sai mật khẩu 401 · trùng email 409 · USER gọi route admin 403 · không có password trong bất kỳ response · không có token trong localStorage.

**Hướng dẫn cho AI (backend)**
```
Bạn là backend dev (NestJS + Prisma). Đọc packages/contracts/openapi.yaml, AGENTS.md.

Implement apps/api/src/modules/auth:
- register: email unique (409 nếu trùng), hash argon2id, role USER, trả 201 + DTO không có password.
- login: verify argon2, ký JWT { sub, role } hạn 7d, set cookie httpOnly path=/ SameSite=Lax Secure=false,
  trả user DTO (KHÔNG trả token trong body).
- logout: clear cookie. me: đọc cookie, trả user hiện tại (401 nếu không có/không hợp lệ).
- Guards: JwtAuthGuard, RolesGuard + @Roles('ADMIN'), @CurrentUser().
- ExceptionFilter: { code, message } theo bảng mã lỗi ở Phần VI. Rate limit login 5 req/phút.

Bảo mật: không log password/token; không trả passwordHash; không nhận role từ client.
Test: trùng email → 409; sai mật khẩu → 401; /auth/me không cookie → 401; route admin với USER → 403.
Ưu tiên: merge JwtAuthGuard sớm nhất có thể để module listings dùng lại.
```

**Hướng dẫn cho AI (frontend)**
```
Bạn là frontend dev. Dùng api client có sẵn ở src/shared/api (không tự viết fetch).

- /login, /register: react-hook-form + zod; map lỗi server { code, message } về đúng ô nhập;
  trạng thái loading; chuyển trang sau khi thành công.
- ProtectedRoute: chưa đăng nhập → redirect /login?next=<path>.
- Header: hiện tên user + nút đăng xuất khi đã đăng nhập.
- Test component: submit sai định dạng, sai mật khẩu, đăng nhập thành công.

Ràng buộc: không lưu token ở localStorage; không sửa src/shared/api và src/app (báo TV5/TV6 nếu thiếu).
```

---

## TASK 1.9 — Tạo, xem và ẩn tin đăng
**Người:** Vu Anh Duck (BE, 4 SP) + Vũ Tâm (FE, 4 SP) · **8 SP** · sau `listings` + **guard**

**Các bước thực hiện**

*Backend (Anh Duck)*
1. `POST /listings`: `sellerId` lấy **từ JWT**, không từ body; `status = APPROVED` (TODO Sprint 4).
2. `GET /listings`: chỉ `APPROVED`, phân trang `page`/`limit`, sort `createdAt` desc, trả `meta`.
3. `GET /listings/:id`: 404 nếu không tồn tại, hoặc `HIDDEN` mà người xem không phải owner/admin.
4. `PATCH /listings/:id`: chỉ owner (403), `IN_DEAL` → 409.
5. `POST /listings/:id/hide`: soft hide, không xoá bản ghi.

*Frontend (Vũ Tâm)*
6. `/listings`: grid card + phân trang + 3 trạng thái.
7. `/listings/new`: form đầy đủ field, giá định dạng VND.
8. `/my-listings`: bảng tin của tôi + nút ẩn tin.

**AC:** tạo tin → thấy ngay trong danh sách · sửa tin người khác 403 · giá âm 400 · tin ẩn với user thường 404 · phân trang đúng.

**Hướng dẫn cho AI (backend)**
```
Bạn là backend dev (NestJS + Prisma). Đọc openapi.yaml, state-machine.md, AGENTS.md.
Dùng JwtAuthGuard và @CurrentUser() từ module auth (đã có).

- POST /listings: cần đăng nhập; sellerId = user hiện tại; status = APPROVED (TODO Sprint 4);
  validate: title 5-120, price > 0, condition enum, categoryId/brandId phải tồn tại.
- GET /listings: chỉ APPROVED; page/limit (mặc định 1/20, tối đa 100); sort createdAt desc;
  response { items, meta: { page, limit, total, totalPages } }.
- GET /listings/:id: 404 nếu không tồn tại; HIDDEN chỉ trả cho owner hoặc ADMIN.
- PATCH /listings/:id: chỉ owner (403 LISTING_NOT_OWNER); status IN_DEAL → 409 LISTING_IN_DEAL.
- POST /listings/:id/hide: soft hide (status = HIDDEN).

Bảo mật: KHÔNG nhận sellerId từ body; mọi kiểm tra ownership ở tầng service.
Test: 5 case bắt buộc kể trên.
```

**Hướng dẫn cho AI (frontend)**
```
Bạn là frontend dev. Dùng api client của TV5 và layout/component của TV6.

- /listings: grid card (title, giá VND, condition badge, category, brand), phân trang,
  loading/empty/error.
- /listings/new: form gồm title, description, price (input định dạng VND), condition (select),
  category (select từ /categories), brand (select từ /brands); validate zod khớp DTO BE.
- /my-listings: bảng tin của tôi, nút ẩn tin có confirm, refetch sau khi ẩn.
- /listings/:id: chi tiết (Sprint 1 chỉ hiển thị, nút "Quan tâm" disabled).

Ràng buộc: không sửa apps/api; không sửa src/app và src/shared.
```

---

## TASK 1.10 — Kiểm thử luồng cốt lõi và chuẩn bị demo
**Người:** Nguyễn Đăng Minh (QA) + cả nhóm · **3 SP** · viết từ D3, chạy từ D9

**Các bước thực hiện**
1. **Từ D3:** chuyển AC của 1.2 + invariant của 1.3 thành test case có mã `TC-xx`.
2. Phân loại: happy path / ngoại lệ / phân quyền / dữ liệu biên.
3. **Từ D9:** chạy toàn bộ, ghi kết quả Pass/Fail vào báo cáo.
4. Viết kịch bản demo 5–7 phút theo thứ tự: seed → đăng nhập → tạo tin → thấy trong danh sách → ẩn tin.
5. **Quay video demo dự phòng 3–5 phút** (rủi ro local-only: máy demo hỏng).
6. Cập nhật backlog Sprint 2.

**Bộ test case tối thiểu**

| Mã | Nội dung | Loại |
|---|---|---|
| TC-01 | Đăng ký email mới thành công | Happy |
| TC-02 | Đăng ký email trùng → 409 | Ngoại lệ |
| TC-03 | Đăng nhập đúng → có cookie, `/me` OK | Happy |
| TC-04 | Đăng nhập sai → 401 | Ngoại lệ |
| TC-05 | USER gọi route ADMIN → 403 | Phân quyền |
| TC-06 | Tạo tin đăng đủ field → hiện trong danh sách | Happy |
| TC-07 | Tạo tin thiếu field / giá âm → 400 | Biên |
| TC-08 | Sửa tin của người khác → 403 | Phân quyền |
| TC-09 | Ẩn tin → user thường không thấy | Happy |
| TC-10 | Phân trang: page vượt tổng → mảng rỗng, không lỗi | Biên |

**Hướng dẫn cho AI**
```
Bạn là QA. Đọc docs/requirements/user-stories.md và docs/design/state-machine.md.

1. Viết docs/test/test-cases.md: bảng mã TC | Story/Invariant liên quan | Tiền điều kiện |
   Bước thực hiện | Kết quả mong đợi | Mức ưu tiên. Tối thiểu 10 case, phủ happy path,
   ngoại lệ, phân quyền, dữ liệu biên.
2. Viết docs/test/test-report.md: kết quả Pass/Fail từng case, ghi chú lỗi phát hiện được.
3. Viết docs/test/demo-script.md: kịch bản demo 5-7 phút, có câu nói thuyết trình,
   lệnh chuẩn bị (make reset-db, make seed, make dev), và checklist dự phòng (video, ảnh chụp).

Ràng buộc: test case phải kiểm chứng được, không viết "hệ thống hoạt động tốt".
```

---

# PHẦN IV — PHÂN CÔNG, LỊCH VÀ ĐIỂM NGHẼN

## 4.1 Bảng phân công

| Thành viên | Mũ | Task (SP) | Tổng | Vùng file sở hữu |
|---|---|---|---|---|
| **Gia Khanh Pham** | PM/BA | 1.1 (5) + 1.2 (3) | **8** | `docs/requirements/`, board |
| **Nguyễn Đăng Minh** | SA/QA | 1.3 (3) + 1.10 (3) | **6** | `docs/design/state-machine.md`, `docs/test/` |
| **Đỗ Thái Dương** | Architect | 1.4 (5) | **5** | `docs/design/` (trừ state-machine), `packages/contracts/` |
| **Nguyễn Đức Nguyên** | Platform/DB | 1.6 (2) + 1.7-schema (3) | **5** | `prisma/schema.prisma`, `migrations/`, `Makefile`, `docker-compose.yml`, `AGENTS.md`, `.husky/` |
| **Nguyễn Minh Việt** | Backend | 1.8-BE (4) + 1.11-api (1.5) | **5.5** | `apps/api/src/modules/auth/`, `src/common/`, `web/src/shared/api/`, `web/src/mocks/` |
| **Phi Hoàng** | Frontend | 1.11-shell (1.5) + 1.8-FE (4) | **5.5** | `web/src/app/`, `web/src/features/auth/`, `web/src/shared/ui/` |
| **Vu Anh Duck** | Backend | 1.7-seed (2) + 1.9-BE (4) | **6** | `prisma/seed.ts`, `apps/api/src/modules/listings/` |
| **Vũ Tâm** | Frontend/UI | 1.5 (3) + 1.9-FE (4) | **7** | `docs/design/wireframes/`, `web/src/features/listings/` |

## 4.2 Lịch D1–D13

| Người | D1–D2 | D3–D4 | D5–D7 | D8–D11 | D12–D13 |
|---|---|---|---|---|---|
| Gia Khanh Pham | 1.1 → 1.2 | Review 1.3, chốt G1 | Khung SRS | Hỗ trợ ghép nối | Slide + retro |
| Đăng Minh | 1.3 nháp | 1.3 chốt ⚠️ | Test case từ AC | Test case chạy | 1.10 |
| Thái Dương | openapi v0 | 1.4 + v1 | Review contract | Review PR | Rà tài liệu |
| Đức Nguyên | 1.6 | schema `users` | schema còn lại | Hỗ trợ migration | Chốt seed demo |
| Minh Việt | Đọc contract | api client + MSW | 1.8-BE + guard sớm D6 | Hoàn thiện | Bugfix |
| Phi Hoàng | Layout trống | 1.11 shell | 1.8-FE | Ghép thật | Bugfix |
| Anh Duck | Khung module | 1.7 seed | 1.9-BE | Ghép + fix | Bugfix |
| Vũ Tâm | 1.5 | Design token | 1.9-FE (mock) | Ghép + fix | Bugfix |

## 4.3 Ba mốc (gate)

| Gate | Khi | Điều kiện qua | Nếu trượt |
|---|---|---|---|
| **G1** Design freeze | Cuối D4 | 1.3 + 1.4 + contract v1 + wireframe xong | Cắt scope FE (chỉ 2 màn hình) |
| **G2** Demo path chạy | Cuối D11 | Đăng nhập → tạo tin → thấy trong danh sách, chạy trên máy thật | Cắt "ẩn tin" và "tin của tôi" |
| **G3** Demo | D13 | `make check` xanh + video dự phòng + slide | — |

## 4.4 Đường găng

```
1.1 → 1.3 → 1.4 → 1.7 → 1.8 → 1.9 → 1.10
```
Hai điểm nghẽn nguy hiểm nhất: **1.3** và **1.4** (mỗi task 1 người, chặn 4 stream). Giảm rủi ro: Thái Dương review 1.3 **ngay khi có nháp**, chia contract làm 2 đợt v0/v1.

## 4.5 Thứ tự cắt scope khi trễ

1. Cắt `hide` + trang "tin của tôi" (trong 1.9) — vẫn demo được tạo + xem.
2. Cắt wireframe chi tiết tin (1.5) — còn 3 màn hình.
3. Giảm seed từ 30 → 10 tin.
4. **Không cắt:** 1.3, ràng buộc DB của 1.7, auth + guard, 1.10.

---

# PHẦN V — QUY TRÌNH LÀM VIỆC HẰNG NGÀY

## 5.1 Daily 15 phút
Mỗi người trả lời 3 câu, **không giải thích dài**:
1. Hôm qua xong gì (kèm Task ID)?
2. Hôm nay làm gì?
3. Đang bị chặn gì / cần ai giúp?

## 5.2 Vòng đời một task

```
1. Chọn task đúng thứ tự (Phần IV)
2. Kiểm tra Definition of Ready  ─── thiếu → báo PM, không tự bắt đầu
3. Tạo branch feat/<task-id>-<mô tả>
4. Viết prompt AI theo mẫu 7 phần + dán kèm AGENTS.md
5. Code → chạy make check → chạy thử tay trên local
6. Prompt agent review đối kháng (7.4) → sửa hết Blocker/Major
7. Mở PR (template Phần VI) → nhờ 1 người stream khác review
8. Merge → cập nhật board → lưu prompt log
```

## 5.3 Xử lý khi bị chặn

| Tình huống | Làm gì |
|---|---|
| Contract chưa có | Dùng MSW mock theo dự thảo, báo Architect |
| Schema thiếu cột | Mở issue cho Nguyễn Đức Nguyên, không tự sửa |
| Merge conflict | Rebase trên `main` mới nhất, chạy lại `make check`, không tự chọn "theirs" |
| Không hiểu yêu cầu | Hỏi PM/SA trong kênh chung, ghi lại câu trả lời vào task card |
| AI sinh code sai liên tục | Dừng, viết lại task card chi tiết hơn — **vấn đề thường ở prompt, không ở AI** |

## 5.4 Mẫu báo cáo cuối ngày (đăng kênh chung)

```
[D1] Nguyễn Đức Nguyên
- Xong: 1.6 repo + Makefile (PR #3 merged)
- Tiếp: 1.7 schema users
- Chặn: chờ ERD từ 1.4 (dự kiến D2)
```

---

# PHẦN VI — PHỤ LỤC

## 6.1 Template PR

```markdown
## Task
[1.x] Tên task — link tới board

## Đã làm gì
- ...

## Cách kiểm chứng
1. `make reset-db && make seed && make dev`
2. <các bước bấm thử>
Kết quả mong đợi: ...

## Checklist
- [ ] AC đạt đủ
- [ ] `make check` xanh
- [ ] Có test happy path + 1 case lỗi
- [ ] Không có `any`, không `console.log`
- [ ] Không sửa file ngoài phạm vi
- [ ] Đã lưu prompt vào docs/ai/prompts/

## Ảnh chụp / video (nếu là UI)
```

## 6.2 Bảng mã lỗi chuẩn hoá

| HTTP | Code | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Dữ liệu đầu vào sai |
| 401 | `AUTH_UNAUTHENTICATED` | Thiếu/sai cookie, chưa đăng nhập |
| 401 | `AUTH_INVALID_CREDENTIALS` | Sai email/mật khẩu |
| 403 | `AUTH_FORBIDDEN` | Không đủ role |
| 403 | `LISTING_NOT_OWNER` | Sửa/ẩn tin của người khác |
| 404 | `LISTING_NOT_FOUND` | Không tồn tại hoặc không được xem |
| 409 | `AUTH_EMAIL_TAKEN` | Email đã đăng ký |
| 409 | `LISTING_IN_DEAL` | Tin đang trong giao dịch |
| 429 | `RATE_LIMITED` | Quá nhiều lần đăng nhập |
| 500 | `INTERNAL_ERROR` | Lỗi không mong đợi (không lộ stack trace) |

## 6.3 Checklist cuối Sprint 1 (D13)

- [ ] `make check` + `make test:api` + `make e2e` xanh trên máy ít nhất 2 thành viên
- [ ] Máy demo: `git pull` → `make reset-db` → `make seed` → `make dev` chạy < 5 phút
- [ ] Demo đúng luồng: đăng nhập → tạo tin → thấy trong danh sách → ẩn tin
- [ ] Tài khoản demo (admin/user) + mật khẩu ghi trong README
- [ ] **Video demo dự phòng 3–5 phút** lưu ở 2 nơi
- [ ] Slide: kiến trúc, ERD, state machine, kết quả test, việc còn lại
- [ ] Test report có Pass/Fail từng case
- [ ] Backlog Sprint 2 đã cập nhật theo thứ tự 2.1 → 2.6

## 6.4 Thuật ngữ

| Thuật ngữ | Nghĩa trong dự án |
|---|---|
| Listing | Tin đăng bán/trao đổi một thiết bị |
| PurchaseRequest | Yêu cầu mua của người mua |
| ExchangeOffer | Đề nghị trao đổi: listing A đổi listing B |
| Deal | Giao dịch đã xác nhận (mua hoặc trao đổi) |
| Invariant | Điều kiện bất biến, không bao giờ được vi phạm |
| Golden path PR | PR mẫu đầy đủ (code + test + review) để cả nhóm copy style |
| Gate | Mốc kiểm soát, trượt gate thì phải cắt scope |
| Spike | Việc dò tìm kỹ thuật, không tính vào feature |

---

**Hết phiên bản 1.0.** Khi Sprint 1 kết thúc, cập nhật Phần III sang Sprint 2 và giữ nguyên Phần I, II, V, VI.
