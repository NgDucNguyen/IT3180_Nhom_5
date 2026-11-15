"use client";

import { Container } from "@/components/layout";
import { ErrorState } from "@/components/ui";

interface ListingsErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Trang xử lý lỗi (Error Boundary) cho phân hệ Khám phá (/listings).
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default function ListingsErrorPage({
  error,
  reset,
}: ListingsErrorPageProps) {
  return (
    <main className="py-12">
      <Container>
        <ErrorState
          title="Không thể tải danh sách thiết bị điện tử"
          message={
            error.message ||
            "Đã có lỗi kết nối tạm thời khi truy vấn dữ liệu sản phẩm. Vui lòng thử lại."
          }
          onRetry={reset}
          backHref="/"
          backLabel="Về Trang chủ"
        />
      </Container>
    </main>
  );
}
