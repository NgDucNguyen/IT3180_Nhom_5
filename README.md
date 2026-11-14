# Chợ Thiết Bị Điện Tử — Electronics Trading & Exchange Marketplace

> **IT3180 — Nhóm 5** · Nền tảng C2C mua bán & trao đổi thiết bị điện tử
> Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 · **SQLite**

---

## ⚡ CHẠY DỰ ÁN TRONG 4 BƯỚC (dành cho 7 thành viên còn lại)

```bash
# 1. Cài dependencies
npm install

# 2. Tạo database SQLite từ schema (file prisma/dev.db)
npx prisma db push

# 3. Nạp dữ liệu mẫu (5 danh mục, 6 hãng, 4 user, 11 tin đăng)
npx prisma db seed

# 4. Chạy dev server
npm run dev
```

Mở **http://localhost:3000**

> Nếu `npx prisma db seed` báo lỗi thiếu `tsx`, chạy `npm install` lại rồi thử lại.
> Nếu lỡ làm hỏng dữ liệu: `npm run db:reset` (xoá DB → tạo lại → seed).

---

## 👤 TÀI KHOẢN DEMO

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@nhom5.vn` | `123456` | ADMIN |
| `an@nhom5.vn` | `123456` | USER |
| `binh@nhom5.vn` | `123456` | USER |
| `chi@nhom5.vn` | `123456` | USER |

> Mật khẩu dạng thô chỉ dùng cho môi trường học tập. Code dùng `bcryptjs` (cost 10).

---

## 🔗 ENDPOINT CÓ SẴN

| Method | Endpoint | Mô tả | Owner |
|---|---|---|---|
| GET | `/api/categories` | Danh sách danh mục (kèm `listingCount`) | TV2 |
| GET | `/api/brands` | Danh sách thương hiệu (kèm `listingCount`) | TV2 |

Response chuẩn:

```jsonc
{ "data": [ /* ... */ ] }                                  // thành công
{ "error": { "code": "VALIDATION_ERROR", "message": "…" } } // thất bại
```

---

## 🗂 CẤU TRÚC THƯ MỤC

```
├─ prisma/
│  ├─ schema.prisma        # 8 model — CHỈ TV2 được sửa
│  ├─ seed.ts              # dữ liệu mẫu
│  └─ dev.db               # SQLite (tự sinh, KHÔNG commit)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx        # TV4
│  │  ├─ page.tsx          # TV4 (hiện là trang tạm của TV2)
│  │  ├─ globals.css       # TV4
│  │  └─ api/
│  │     ├─ categories/    # TV2
│  │     └─ brands/        # TV2
│  ├─ components/
│  │  ├─ layout/           # TV4: Navbar, Footer
│  │  └─ ui/               # TV4: Button, Card, Input…
│  ├─ features/
│  │  ├─ auth/             # TV1
│  │  ├─ catalog/          # TV2
│  │  ├─ listing/          # TV3
│  │  ├─ discovery/        # TV4
│  │  ├─ purchase/         # TV5
│  │  ├─ transaction/      # TV6
│  │  ├─ exchange/         # TV7
│  │  ├─ report/           # TV8
│  │  └─ admin/            # TV8
│  └─ lib/
│     ├─ prisma.ts         # Prisma Client singleton (TV2)
│     ├─ constants.ts      # trạng thái hợp lệ (TV2)
│     ├─ listing-state.ts  # quy tắc chuyển trạng thái (TV2)
│     └─ api-response.ts   # format response chuẩn (TV2)
├─ docs/
│  ├─ diagrams/erd.md      # ERD + state machine
│  └─ srs/                 # đặc tả yêu cầu
├─ tests/                  # Vitest
├─ AGENTS.md               # ⚠️ LUẬT CHO AI AGENT — ĐỌC TRƯỚC KHI CODE
└─ GUIDE.md                # phân công 8 thành viên
```

---

## 📜 SCRIPTS

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy dev server (cổng 3000) |
| `npm run build` | Build production |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm test` | Chạy test |
| `npm run check` | **typecheck + test** (bắt buộc trước khi commit) |
| `npm run db:push` | Đồng bộ schema → DB |
| `npm run db:seed` | Nạp dữ liệu mẫu |
| `npm run db:reset` | Xoá DB + tạo lại + seed |
| `npm run db:studio` | Mở Prisma Studio xem dữ liệu |

---

## 🌿 QUY TRÌNH GIT

```bash
git checkout develop
git pull origin develop
git checkout -b feat/tv3-listing-create

# code...

git add .
git commit -m "feat(listing): API tạo tin đăng [TV3]"
git push origin feat/tv3-listing-create
```

- `main` → bản ổn định để demo
- `develop` → nhánh tích hợp của nhóm
- `feat/tvX-<mô-tả>` → nhánh cá nhân
- Mở **Pull Request** vào `develop`, cần ≥ 1 người approve.
- **Không push trực tiếp lên `main`.**

---

## ⚠️ TRƯỚC KHI VIẾT CODE

1. Đọc **[`AGENTS.md`](./AGENTS.md)** — luật phân vùng file cho 8 người.
2. Đọc **[`docs/diagrams/erd.md`](./docs/diagrams/erd.md)** — hiểu schema.
3. Đọc **[`GUIDE.md`](./GUIDE.md)** — phân công vai trò.
4. Chỉ sửa file trong vùng của mình. Cần đổi schema → báo **TV2**.

---

## 🛠 XỬ LÝ SỰ CỐ

| Hiện tượng | Cách xử lý |
|---|---|
| `PrismaClientInitializationError` | Chạy `npx prisma generate` rồi `npx prisma db push` |
| `Prisma: Cannot find table` | Chưa `db push` → chạy `npm run db:reset` |
| Cổng 3000 bị chiếm | `npm run dev -- -p 3001` |
| File `dev.db` hỏng | `npm run db:reset` |
| Lỡ xoá `node_modules` | `npm install` |
| Không thấy dữ liệu mẫu | `npm run db:seed` |

---

## 📌 GHI CHÚ THIẾT KẾ

- **SQLite không hỗ trợ enum** → trạng thái là `String`, giá trị hợp lệ nằm ở
  `src/lib/constants.ts`. Không hardcode chuỗi.
- **Tiền là `Int` (VND)**, không dùng `Float`.
- **`specsJson` / `imagesJson`** là chuỗi JSON, phải `JSON.parse` khi đọc.
- **DB file không commit** — mỗi người tự `db push` + `db seed` trên máy mình.

---

*Base project & schema: TV2 (System / DB Architect).*
