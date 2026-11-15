import { Container } from "@/components/layout";
import { SellerListings } from "@/features/listing/components/SellerListings";
import { requireListingPageUser } from "@/features/listing/page-auth";
import { getSellerListings } from "@/features/listing/service";
import { isListingStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireListingPageUser();
  const rawParams = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["page", "status"] as const) {
    const value = rawParams[key];
    if (typeof value === "string") params.set(key, value);
  }
  const statusValue = params.get("status");
  const status = statusValue && isListingStatus(statusValue) ? statusValue : undefined;
  if (!status) params.delete("status");
  const result = await getSellerListings(user.id, params);
  return (
    <main className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-5xl">
          <SellerListings result={result} status={status} created={rawParams.created === "1"} />
        </div>
      </Container>
    </main>
  );
}
