import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/layout";
import { AppSessionProvider } from "@/features/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elade C2C | Sàn Mua Bán & Trao Đổi Thiết Bị Điện Tử - Nhóm 5",
  description:
    "Nền tảng thương mại điện tử C2C cho phép mua bán và trao đổi thiết bị điện tử mới/đã qua sử dụng — Học phần Nhập môn Công nghệ phần mềm (IT3180) Nhóm 5",
};

/**
 * Root Layout — Bộ khung giao diện dùng chung cho toàn bộ dự án.
 *
 * ⚠️ PHÂN VÙNG: TV4 (UI/UX Lead) sở hữu file này.
 * Các thành viên khác KHÔNG sửa file này để tránh Merge Conflict.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <AppSessionProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AppSessionProvider>
      </body>
    </html>
  );
}
