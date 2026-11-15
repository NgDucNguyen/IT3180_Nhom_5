import { Container } from "@/components/layout";
import { PageLoader } from "@/components/ui";

/**
 * Trạng thái đang tải của trang Khám phá & Lọc thiết bị (/listings).
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default function ListingsLoading() {
  return (
    <main className="py-8">
      <Container>
        <PageLoader
          label="Đang lọc và nạp danh sách thiết bị điện tử..."
          cardCount={9}
        />
      </Container>
    </main>
  );
}
