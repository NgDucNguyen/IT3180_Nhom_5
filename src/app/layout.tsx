import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chợ Thiết Bị Điện Tử | Nhóm 5",
  description:
    "Nền tảng mua bán và trao đổi thiết bị điện tử - IT3180 Nhóm 5",
};

/**
 * Root layout - khung chung của toàn ứng dụng.
 *
 * ⚠️ PHÂN VÙNG: TV4 (UI/UX Lead) chịu trách nhiệm thêm Navbar/Footer/Theme
 * bằng cách import component từ src/components/layout/ vào đây.
 * Các thành viên khác KHÔNG sửa file này mà tạo layout riêng trong route group
 * của mình, ví dụ: src/app/(auth)/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
