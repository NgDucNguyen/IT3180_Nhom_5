# Sơ đồ Kiến trúc Hệ thống — ElectroSwap C2C

> **Tác giả:** TV2 — System / DB Architect · **Cập nhật:** Sprint 1  
> **Stack:** Next.js 16 (App Router) · TypeScript (`strict: true`) · Tailwind CSS v4 · Prisma 6 · SQLite

---

## 1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (LAYERED ARCHITECTURE)

```mermaid
flowchart TB
    subgraph Client["Tầng Giao diện (Browser / Client Components)"]
        UI_Pages["Next.js App Router Pages\n(/, /listings, /login, /profile, /admin...)"]
        UI_Kit["Shared UI & Layout (TV4)\nNavbar, Footer, ListingCard, StatusBadge"]
    end

    subgraph Server["Tầng Ứng dụng Next.js 16 (Server Runtime)"]
        RSC["Server Components\n(Truy vấn trực tiếp cho SSR)"]
        API["Route Handlers (/api/*)\nauth, categories, brands, listings,\npurchase-requests, exchange-offers, transactions, reports, admin"]
        Features["Feature Services (src/features/*)\nauth (TV1) · catalog (TV2) · listing (TV3) · discovery (TV4)\npurchase (TV5) · transaction (TV6) · exchange (TV7) · report/admin (TV8)"]
        SharedLib["Thư viện Nền Dùng Chung (src/lib/* - TV2)\nconstants.ts · listing-state.ts · api-response.ts · auth.ts (TV1)"]
    end

    subgraph Data["Tầng Dữ liệu (Data Access & Persistence - TV2)"]
        Prisma["Prisma Client Singleton\n(src/lib/prisma.ts)"]
        SQLite[("SQLite Database\n(prisma/dev.db)")]
    end

    UI_Pages --> UI_Kit
    UI_Pages -->|"Fetch JSON { data } / { error }"| API
    UI_Pages -->|"Render trực tiếp"| RSC
    RSC --> Features
    API --> Features
    API --> SharedLib
    Features --> SharedLib
    Features --> Prisma
    Prisma --> SQLite
```

---

## 2. LUỒNG XỬ LÝ REQUEST CHUẨN (SEQUENCE DIAGRAM)

```mermaid
sequenceDiagram
    actor User as Người dùng (Browser)
    participant Route as Route Handler (/api/*)
    participant Lib as Shared Lib (api-response / listing-state)
    participant Service as Feature Service (src/features/*)
    participant Prisma as Prisma Singleton (src/lib/prisma.ts)
    participant DB as SQLite (prisma/dev.db)

    User->>Route: Gửi HTTP Request (kèm httpOnly Cookie nếu cần auth)
    Route->>Service: Gọi hàm xử lý nghiệp vụ
    Service->>Lib: Kiểm tra trạng thái hợp lệ (canTransition* / assert*Transition)
    alt Chuyển trạng thái hoặc dữ liệu không hợp lệ
        Lib-->>Route: Ném lỗi / trả về trạng thái sai
        Route->>Lib: fail("VALIDATION_ERROR" | "CONFLICT", message)
        Lib-->>User: HTTP 400 / 409 { error: { code, message } }
    else Hợp lệ
        Service->>Prisma: Thực thi truy vấn (select tường minh, dùng $transaction khi đổi trạng thái)
        Prisma->>DB: SQL Query
        DB-->>Prisma: Kết quả bản ghi
        Prisma-->>Service: Dữ liệu an toàn (không có passwordHash)
        Service-->>Route: Trả dữ liệu
        Route->>Lib: ok(data, 200 | 201)
        Lib-->>User: HTTP 200 / 201 { data: ... }
    end
```

---

## 3. NGUYÊN TẮC KIẾN TRÚC BẮT BUỘC

1. **Một kết nối Prisma duy nhất (`src/lib/prisma.ts`):** Mọi module bắt buộc `import { prisma } from "@/lib/prisma"`, không khởi tạo `new PrismaClient()` ở nơi khác để tránh khóa file SQLite khi Next.js hot-reload.
2. **State Machine tập trung (`src/lib/constants.ts` & `src/lib/listing-state.ts`):** Do SQLite không hỗ trợ `enum`, mọi giá trị trạng thái và bảng chuyển trạng thái của `Listing`, `PurchaseRequest`, `ExchangeOffer`, `Transaction` được kiểm soát tập trung tại tầng `src/lib/`.
3. **Chuẩn hóa phản hồi API (`src/lib/api-response.ts`):** Toàn bộ Route Handler trả về đúng cấu trúc `{ data }` hoặc `{ error: { code, message } }`.
4. **Phân vùng sở hữu theo chiều dọc (Vertical Slice per Member):** Mỗi thành viên sở hữu trọn vẹn `src/features/<module>`, `src/app/api/<module>`, trang UI tương ứng và file `tests/<module>.test.ts` để tránh xung đột Git.
