# Feature: Auth & Hồ sơ cá nhân — **TV1**

**Mũ 1:** PM / Scrum Master · **Mũ 2:** Module Auth

## Phạm vi
- Đăng ký tài khoản (email + mật khẩu), hash `bcryptjs` cost 10
- Đăng nhập / đăng xuất, JWT trong **httpOnly cookie**
- Middleware phân quyền `USER` / `ADMIN`
- Xem & cập nhật hồ sơ (`fullName`, `phone`, `avatarUrl`)

## API dự kiến
| Method | Route | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập → set cookie |
| POST | `/api/auth/logout` | Xoá cookie |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| PATCH | `/api/profile` | Cập nhật hồ sơ |

## Model liên quan
`User` — xem `docs/diagrams/erd.md`

## File được sửa
`src/features/auth/**`, `src/app/api/auth/**`, `src/app/(auth)/**`,
`src/app/profile/**`, `src/lib/auth.ts`, `src/middleware.ts`

## Lưu ý bảo mật
- **Cấm** lưu token vào localStorage
- Không bao giờ trả `passwordHash` trong response
- Cookie: `httpOnly`, `sameSite: "lax"`, `secure: false` (localhost)
- Dùng `JWT_SECRET` từ `.env`

## Trạng thái triển khai — TV1 Sprint 1

Đã có bốn API Auth, form `/login`, `/register`, hồ sơ chỉ đọc `/profile` và logout.
Xem đặc tả tại `docs/srs/module-tv1-auth.md`, kế hoạch tại `SPRINT-1-PLAN.md`.

### Cấu hình local

- Dùng Node 22 (Node 18 không chạy được Next.js của repo).
- `JWT_SECRET` trong `.env` phải ngẫu nhiên và có ít nhất 32 byte;
  không dùng nguyên giá trị mẫu `change-me-in-local-dev`.
- Chạy `npm ci`, `npm run db:generate`, `npm run db:push`, `npm run db:seed`.
- Nếu Prisma báo `Schema engine error` khi file DB chưa tồn tại, tạo file SQLite rỗng
  tại `prisma/dev.db` rồi chạy lại `db:push`; không sửa schema để xử lý lỗi môi trường.
- Kiểm tra: `npm run check`, `npm run build`, `npm run dev`.

### Tích hợp cho các thành viên khác

```ts
import { getCurrentUser, requireUser, requireAdmin } from "@/lib/auth";
import { authErrorResponse } from "@/features/auth/errors";

// Server Component: await getCurrentUser() → user an toàn hoặc null.
// Route Handler: await requireUser(request) / requireAdmin(request).
// Bọc bằng try/catch; return authErrorResponse(error) để giữ đúng 401/403.
```

Helper đọc lại role/status từ DB; tài khoản LOCKED ném AuthError 403.
Không có/sai/hết hạn phiên: getCurrentUser trả null, requireUser ném 401.
Không nhận userId/role từ body để thay thế các helper này.
TV4 có thể gọi GET `/api/auth/me` để đồng bộ Navbar ở Sprint 2.
Cập nhật profile, middleware toàn ứng dụng và thu hồi JWT chưa nằm trong bản này.


### Kiểm thử Chrome tùy chọn

Kịch bản `tests/auth-browser.mjs` dùng Chrome và driver Playwright cài ngoài repo,
không sửa package.json/lockfile. Cần Python 3 để dọn đúng tài khoản test trong SQLite local.
Chỉ chạy trên DB demo local `prisma/dev.db`, không dùng DB của môi trường khác.

```bash
# Terminal 1 (Node 22)
npm run dev -- --hostname 127.0.0.1 --port 3180

# Terminal 2: công cụ test tách biệt
npm install --prefix /tmp/it3180-browser playwright-core --no-package-lock
PLAYWRIGHT_MODULE=/tmp/it3180-browser/node_modules/playwright-core/index.mjs node tests/auth-browser.mjs
```

Có thể đặt CHROME_PATH, AUTH_BASE_URL và AUTH_EVIDENCE_DIR khi cần.
Script kiểm tra đăng ký/phone, cookie httpOnly, reload, logout, redirect profile,
đăng nhập sai/đúng, mobile 375px và cảnh báo hydration. Tài khoản test được dọn trong finally.
Ảnh minh chứng đã lưu trong `evidence/` để review PR.
