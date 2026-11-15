import { Container } from "@/components/layout";
import { EmptyState } from "@/components/ui";
import { ShopStorefront } from "@/features/shop";
import { getShopStorefront } from "@/features/shop/service";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface ShopDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { slug } = await params;
  const [storefront, currentUser] = await Promise.all([
    getShopStorefront(slug),
    getCurrentUser().catch(() => null),
  ]);

  if (!storefront) {
    return (
      <main className="py-14">
        <Container>
          <EmptyState
            icon="🏪"
            title="Không tìm thấy cửa hàng"
            description="Shop này không tồn tại, chưa được kích hoạt hoặc tài khoản chủ Shop đang tạm khóa."
            actionLabel="Xem danh sách cửa hàng"
            actionHref="/shops"
          />
        </Container>
      </main>
    );
  }

  const isOwnShop = currentUser?.id === storefront.owner.id;

  return <ShopStorefront storefront={storefront} isOwnShop={isOwnShop} />;
}
