/**
 * Prisma Client singleton.
 *
 * Vì sao cần singleton: ở chế độ dev, Next.js hot-reload tạo lại module rất
 * nhiều lần. Nếu mỗi lần đều `new PrismaClient()` thì sẽ mở hàng trăm kết nối
 * tới SQLite và gây lỗi "too many connections" / khóa file DB.
 *
 * CÁCH DÙNG CHUẨN (bắt buộc với cả 8 thành viên):
 *   import { prisma } from "@/lib/prisma";
 *   const categories = await prisma.category.findMany();
 *
 * TUYỆT ĐỐI KHÔNG:
 *   - `new PrismaClient()` ở bất kỳ file nào khác.
 *   - import từ "@prisma/client" trong component/route (trừ file này).
 *
 * Chủ sở hữu: TV2.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
