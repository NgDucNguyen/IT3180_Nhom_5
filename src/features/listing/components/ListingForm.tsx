"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { CONDITION, CONDITION_LABEL_VI, CONDITION_VALUES, LISTING_STATUS } from "@/lib/constants";
import { parseSpecsJson } from "@/features/discovery/utils";
import { listingApi } from "../api";
import type { ListingCatalogOption, SellerListing } from "../types";

interface ListingFormProps {
  listing?: SellerListing;
  onSaved?: (listing: SellerListing) => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
}

const SPEC_FIELDS = [
  ["screen", "Màn hình", "6.1 inch / 15.6 inch"],
  ["cpu", "CPU / Vi xử lý", "Apple A15 / Intel Core i5"],
  ["ram", "RAM", "8 GB"],
  ["storage", "Bộ nhớ / Lưu trữ", "256 GB / SSD 512 GB"],
  ["battery", "Pin", "Còn 90% / 5 giờ sử dụng"],
] as const;

function readFormJson(value: string | null | undefined): unknown {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function ListingForm({ listing, onSaved, onCancel, onBusyChange }: ListingFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<ListingCatalogOption[]>([]);
  const [brands, setBrands] = useState<ListingCatalogOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [allowExchange, setAllowExchange] = useState(listing?.allowExchange ?? false);
  const [categoryId, setCategoryId] = useState(listing?.categoryId ?? "");
  const [brandId, setBrandId] = useState(listing?.brandId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const initialSpecs = parseSpecsJson(listing?.specsJson);
  const parsedImages = readFormJson(listing?.imagesJson);
  const initialImages = Array.isArray(parsedImages)
    ? parsedImages.filter((value: unknown): value is string => typeof value === "string").join("\n") : "";

  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    setCatalogError("");
    Promise.all([
      listingApi<ListingCatalogOption[]>("/api/categories", { signal: controller.signal }),
      listingApi<ListingCatalogOption[]>("/api/brands", { signal: controller.signal }),
    ]).then(([categoryItems, brandItems]) => {
      if (controller.signal.aborted) return;
      setCategories(categoryItems);
      setBrands(brandItems);
    }).catch(() => {
      if (!controller.signal.aborted) setCatalogError("Chưa tải được danh mục và thương hiệu. Vui lòng thử lại.");
    }).finally(() => {
      if (!controller.signal.aborted) setCatalogLoading(false);
    });
    return () => controller.abort();
  }, [catalogAttempt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    // Giữ thông số ngoài năm ô chuẩn khi sửa tin do module khác hoặc seed tạo.
    const originalSpecs = readFormJson(listing?.specsJson);
    const specs: Record<string, unknown> = originalSpecs && typeof originalSpecs === "object" && !Array.isArray(originalSpecs)
      ? { ...originalSpecs } : {};
    for (const [key] of SPEC_FIELDS) {
      const value = text(`spec-${key}`);
      if (!value) delete specs[key];
      else if (value !== initialSpecs[key]) specs[key] = value;
    }
    const images = text("images").split(/\r?\n/).map((image) => image.trim()).filter(Boolean);
    const input = {
      title: text("title"), description: text("description"), price: Number(text("price")),
      categoryId: text("categoryId"), brandId: text("brandId") || null,
      condition: text("condition"),
      specsJson: Object.keys(specs).length || listing?.specsJson ? JSON.stringify(specs) : null,
      imagesJson: images.length || listing?.imagesJson ? JSON.stringify(images) : null,
      allowExchange, exchangePreference: allowExchange ? text("exchangePreference") || null : null,
    };
    setError("");
    setPending(true);
    onBusyChange?.(true);
    try {
      const saved = await listingApi<SellerListing>(listing ? `/api/listings/${listing.id}` : "/api/listings", {
        method: listing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (onSaved) onSaved(saved);
      else {
        router.push("/seller/listings?created=1");
        router.refresh();
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
      onBusyChange?.(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={pending}>
      {listing?.status === LISTING_STATUS.ACTIVE && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Thay đổi nội dung tin đang bán sẽ gửi tin về chờ duyệt lại.
        </p>
      )}
      {listing?.status === LISTING_STATUS.REJECTED && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Lưu thông tin để gửi tin bị từ chối về chờ duyệt lại.
        </p>
      )}
      {catalogLoading && <p role="status" className="text-sm text-slate-500">Đang tải danh mục và thương hiệu...</p>}
      {catalogError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>{catalogError}</p>
          <Button variant="outline" size="sm" onClick={() => setCatalogAttempt((value) => value + 1)}>Thử lại</Button>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <Card className="space-y-5 sm:p-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Thông tin thiết bị</h2>
            <p className="mt-1 text-sm text-slate-500">Mô tả rõ tình trạng để người mua dễ lựa chọn.</p>
          </div>
          <Input name="title" label="Tiêu đề tin đăng" required minLength={5} maxLength={120}
            defaultValue={listing?.title} placeholder="Ví dụ: iPhone 13 128 GB, pin 90%" helperText="Từ 5 đến 120 ký tự." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select name="categoryId" label="Danh mục" required placeholder="Chọn danh mục"
              value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={catalogLoading || Boolean(catalogError)}
              options={categories.map((item) => ({ value: item.id, label: item.name }))} />
            <Select name="brandId" label="Thương hiệu" value={brandId} onChange={(event) => setBrandId(event.target.value)}
              disabled={catalogLoading || Boolean(catalogError)}
              options={[{ value: "", label: "Không có / Không rõ thương hiệu" }, ...brands.map((item) => ({ value: item.id, label: item.name }))]} />
            <Input name="price" type="number" label="Giá bán (VNĐ)" required min={1} max={2_147_483_647}
              step={1} inputMode="numeric" defaultValue={listing?.price} placeholder="8500000" rightAddon="₫" />
            <Select name="condition" label="Tình trạng" required defaultValue={listing?.condition ?? CONDITION.GOOD}
              options={CONDITION_VALUES.map((value) => ({ value, label: CONDITION_LABEL_VI[value] }))} />
          </div>
          <Textarea name="description" label="Mô tả thiết bị" required minLength={10} rows={5}
            defaultValue={listing?.description} placeholder="Tình trạng sử dụng, phụ kiện đi kèm, lỗi hoặc trầy xước nếu có..."
            helperText="Ít nhất 10 ký tự. Nêu rõ các lỗi của thiết bị nếu có." />
        </Card>
        <Card className="space-y-5 sm:p-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Thông số & hình ảnh</h2>
            <p className="mt-1 text-sm text-slate-500">Chỉ cần điền thông số phù hợp với thiết bị của bạn.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {SPEC_FIELDS.map(([key, label, placeholder]) => (
              <Input key={key} name={`spec-${key}`} label={label} placeholder={placeholder} defaultValue={initialSpecs[key]} />
            ))}
          </div>
          <Textarea name="images" label="Đường dẫn hình ảnh" rows={3} defaultValue={initialImages}
            placeholder={"https://example.com/thiet-bi.jpg\n/images/placeholder-device.svg"}
            helperText="Mỗi dòng một URL http/https hoặc đường dẫn ảnh có sẵn trong ứng dụng. Có thể để trống." />
        </Card>
        <Card className="space-y-4 border-violet-200 bg-violet-50/30 sm:p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input name="allowExchange" type="checkbox" checked={allowExchange} onChange={(event) => setAllowExchange(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-violet-600" />
            <span>
              <span className="block text-sm font-bold text-slate-900">Nhận trao đổi thiết bị</span>
              <span className="mt-1 block text-sm text-slate-500">Cho phép người khác đề nghị đổi thiết bị với bạn.</span>
            </span>
          </label>
          {allowExchange && (
            <Textarea name="exchangePreference" label="Thiết bị mong muốn trao đổi" rows={2}
              defaultValue={listing?.exchangePreference ?? ""} placeholder="Ví dụ: máy tính bảng, có thể thỏa thuận bù tiền" />
          )}
        </Card>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
          {onCancel ? <Button variant="outline" onClick={onCancel}>Hủy chỉnh sửa</Button>
            : <Link href="/seller/listings" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Tin đăng của tôi</Link>}
          <Button type="submit" size="lg" disabled={pending || catalogLoading || Boolean(catalogError) || categories.length === 0}>
            {pending ? "Đang lưu..." : listing ? "Lưu thay đổi" : "Gửi tin chờ duyệt"}
          </Button>
        </div>
      </fieldset>
      {!catalogLoading && !catalogError && categories.length === 0 && (
        <p role="alert" className="text-sm text-amber-700">Chưa có danh mục thiết bị. Vui lòng thử lại sau.</p>
      )}
    </form>
  );
}
