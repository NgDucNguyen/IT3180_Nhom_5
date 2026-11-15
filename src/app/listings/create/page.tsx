import Link from "next/link";
import { Container } from "@/components/layout";
import { ListingForm } from "@/features/listing/components/ListingForm";
import { requireListingPageUser } from "@/features/listing/page-auth";

export const dynamic = "force-dynamic";

export default async function CreateListingPage() {
  await requireListingPageUser();
  return (
    <main className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-4xl">
          <Link href="/seller/listings" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">← Tin đăng của tôi</Link>
          <div className="mb-7 mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Góc người bán</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Đăng tin thiết bị</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">Điền thông tin thiết bị của bạn. Tin sẽ được quản trị viên duyệt trước khi hiển thị công khai.</p>
          </div>
          <ListingForm />
        </div>
      </Container>
    </main>
  );
}
