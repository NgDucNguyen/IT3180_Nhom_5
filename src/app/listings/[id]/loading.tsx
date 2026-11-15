import { Container } from "@/components/layout";
import { PageLoader } from "@/components/ui";

/**
 * Trạng thái đang tải của trang Chi tiết thiết bị (/listings/[id]).
 * Chủ sở hữu: TV4 (UI/UX Lead & Module Discovery).
 */
export default function ListingDetailLoading() {
  return (
    <main className="py-8">
      <Container>
        <PageLoader
          label="Đang tải chi tiết cấu hình và thông số kỹ thuật thiết bị..."
          cardCount={3}
        />
      </Container>
    </main>
  );
}
