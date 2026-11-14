import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Cấu hình Vitest cho toàn dự án.
 * Test đặt trong /tests, đặt tên: <module>.test.ts
 *
 * Chạy: npm test  |  npm run check (typecheck + test)
 *
 * Lưu ý: Next.js tự nạp `.env` khi chạy app, nhưng Vitest thì không.
 * Vì vậy file này nạp `.env` thủ công để Prisma có DATABASE_URL.
 */

// Nạp .env (Node >= 20.12). Bỏ qua nếu file không tồn tại.
try {
  process.loadEnvFile(".env");
} catch {
  // Không có .env (ví dụ trên CI) -> dùng biến môi trường sẵn có
}

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Test dùng chung DB local với app -> chạy tuần tự để tránh khoá SQLite
    fileParallelism: false,
  },
});
