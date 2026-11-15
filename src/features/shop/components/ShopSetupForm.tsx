"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { notifyAuthChanged } from "@/features/cart";
import {
  SHOP_BANNER_THEMES,
  SHOP_BANNER_THEME_VALUES,
  type ShopBannerTheme,
} from "@/lib/constants";
import type { ShopProfileDTO } from "@/features/shop/types";
import { SHOP_THEME_MAP, getShopThemeStyle } from "./theme";

const ALLOWED_AVATAR_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const MAX_INPUT_FILE_BYTES = 5 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_LENGTH = 450_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Không đọc được dữ liệu ảnh."));
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh đã chọn."));
    reader.readAsDataURL(file);
  });
}

/** Cắt vuông & nén ảnh đại diện Shop về 256×256 để lưu gọn vào DB. */
async function processShopAvatarFile(file: File): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.has(file.type.toLowerCase())) {
    throw new Error("Chỉ hỗ trợ ảnh định dạng PNG, JPG, WebP hoặc GIF.");
  }
  if (file.size > MAX_INPUT_FILE_BYTES) {
    throw new Error("Dung lượng tệp ảnh tối đa 5MB.");
  }

  if (file.type.toLowerCase() === "image/gif" && file.size <= 300 * 1024) {
    const raw = await readFileAsDataUrl(file);
    if (raw.length <= MAX_AVATAR_DATA_URL_LENGTH) return raw;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Tệp ảnh bị lỗi hoặc không hợp lệ."));
      image.src = objectUrl;
    });

    const targetSize = 256;
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    }

    const cropSize = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const sx = Math.max(0, Math.floor(((img.naturalWidth || img.width) - cropSize) / 2));
    const sy = Math.max(0, Math.floor(((img.naturalHeight || img.height) - cropSize) / 2));

    ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);

    const webp = canvas.toDataURL("image/webp", 0.85);
    const result = webp.startsWith("data:image/webp")
      ? webp
      : canvas.toDataURL("image/jpeg", 0.86);

    if (result.length > MAX_AVATAR_DATA_URL_LENGTH) {
      const fallbackJpeg = canvas.toDataURL("image/jpeg", 0.72);
      if (fallbackJpeg.length > MAX_AVATAR_DATA_URL_LENGTH) {
        throw new Error("Ảnh sau khi nén vẫn quá lớn, vui lòng chọn ảnh khác.");
      }
      return fallbackJpeg;
    }

    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export interface ShopSetupFormProps {
  mode: "upgrade" | "edit";
  initialShop?: ShopProfileDTO | null;
  defaultPhone?: string | null;
}

/**
 * Form nâng cấp tài khoản Người mua -> Người bán (Mở Shop)
 * hoặc Chỉnh sửa giao diện/hồ sơ Shop hiện tại.
 */
export function ShopSetupForm({
  mode,
  initialShop,
  defaultPhone,
}: ShopSetupFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(initialShop?.name ?? "");
  const [slug, setSlug] = useState(initialShop?.slug ?? "");
  const [tagline, setTagline] = useState(initialShop?.tagline ?? "");
  const [city, setCity] = useState(initialShop?.city ?? "Hà Nội");
  const [address, setAddress] = useState(initialShop?.address ?? "");
  const [contactPhone, setContactPhone] = useState(
    initialShop?.contactPhone ?? defaultPhone ?? "",
  );
  const [description, setDescription] = useState(initialShop?.description ?? "");
  const [bannerTheme, setBannerTheme] = useState<ShopBannerTheme>(
    initialShop?.bannerTheme ?? SHOP_BANNER_THEMES.INDIGO,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialShop?.avatarUrl ?? null,
  );
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const previewTheme = getShopThemeStyle(bannerTheme);
  const previewName = name.trim() || "Tên Shop của bạn";

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError("");
    setProcessingAvatar(true);
    try {
      const dataUrl = await processShopAvatarFile(file);
      setAvatarUrl(dataUrl);
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Không thể tải ảnh đại diện lên.",
      );
    } finally {
      setProcessingAvatar(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");
    setSuccessMessage("");

    try {
      const endpoint = isEdit ? "/api/shop/me" : "/api/shop/upgrade";
      const method = isEdit ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          avatarUrl,
          tagline,
          description,
          city,
          address,
          contactPhone,
          bannerTheme,
        }),
      });

      const body = (await response.json()) as {
        data?: { slug?: string; shop?: { slug?: string } };
        error?: { message?: string };
      };

      if (!response.ok) {
        setError(
          body.error?.message ?? "Không thể lưu thông tin Shop. Vui lòng thử lại.",
        );
        return;
      }

      notifyAuthChanged();
      const resolvedSlug = body.data?.shop?.slug ?? body.data?.slug ?? slug;

      if (isEdit) {
        setSuccessMessage("Đã cập nhật giao diện & thông tin Shop!");
        router.refresh();
      } else {
        router.replace(resolvedSlug ? `/shops/${resolvedSlug}` : "/seller/listings");
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Xem trước Banner Shop */}
      <Card className="overflow-hidden rounded-3xl border-slate-200 p-0 shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          Xem trước giao diện đầu trang Shop trên Elade
        </div>
        <div className="p-5">
          <div
            className={`rounded-2xl bg-gradient-to-br ${previewTheme.gradientClass} p-5 text-white`}
          >
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/15 text-xl font-extrabold text-white">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={previewName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    previewName.charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${previewTheme.badgeClass}`}
                >
                  Shop
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold text-white">
                  {previewName}
                </h2>
                <p className="text-xs text-slate-200">
                  📍 {city.trim() || "Hà Nội"}{" "}
                  {tagline.trim() ? `· ${tagline.trim()}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-slate-200 p-6 shadow-xs sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tải ảnh đại diện (Avatar) của Shop */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-xs font-bold text-slate-800">
              Ảnh đại diện Shop (Avatar)
            </span>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-gradient-to-br ${previewTheme.gradientClass} text-xl font-extrabold text-white shadow-2xs`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={previewName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  previewName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={processingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {processingAvatar
                      ? "Đang xử lý ảnh..."
                      : avatarUrl
                        ? "🖼️ Đổi ảnh đại diện"
                        : "📤 Chọn ảnh từ máy"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={processingAvatar}
                      onClick={() => {
                        setAvatarUrl(null);
                        setAvatarError("");
                      }}
                    >
                      Xóa ảnh
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ PNG, JPG, WebP, GIF (tối đa 5MB). Ảnh sẽ tự cắt vuông
                  256×256px và lưu trực tiếp vào cơ sở dữ liệu của Shop.
                </p>
                {avatarError && (
                  <p role="alert" className="text-xs font-semibold text-rose-600">
                    {avatarError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Tên Shop hiển thị"
              name="name"
              required
              minLength={3}
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Minh Đức Tech Store"
              helperText="Từ 3–60 ký tự, hiển thị trên mọi sản phẩm bạn đăng bán."
            />

            <Input
              label="Đường dẫn Shop (tùy chọn)"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="minh-duc-tech-store"
              helperText="Để trống hệ thống sẽ tự tạo từ Tên Shop."
            />
          </div>

          <Input
            label="Khẩu hiệu ngắn (Tagline)"
            name="tagline"
            maxLength={140}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ví dụ: Chuyên Laptop & Điện thoại nguyên zin — Bao test trực tiếp"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Khu vực / Thành phố"
              name="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Hà Nội / TP. Hồ Chí Minh / Đà Nẵng"
            />

            <Input
              label="Số điện thoại Shop"
              name="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="0912345678"
            />
          </div>

          <Input
            label="Địa chỉ xem & giao dịch trực tiếp"
            name="address"
            maxLength={200}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
          />

          <Textarea
            label="Giới thiệu chi tiết về Shop & chính sách bao test"
            name="description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả uy tín cửa hàng, cam kết tình trạng máy, thời gian xem máy..."
          />

          <div>
            <span className="mb-2 block text-xs font-bold text-slate-800">
              Chọn màu chủ đề Banner Shop
            </span>
            <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {SHOP_BANNER_THEME_VALUES.map((themeKey) => {
                const item = SHOP_THEME_MAP[themeKey];
                const selected = bannerTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setBannerTheme(themeKey)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full ${item.swatchClass}`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700"
            >
              {successMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              href={isEdit && initialShop ? `/shops/${initialShop.slug}` : "/profile"}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Quay lại
            </Link>

            <Button type="submit" size="md" disabled={pending}>
              {pending
                ? "Đang xử lý..."
                : isEdit
                  ? "Lưu thay đổi Shop"
                  : "🚀 Kích hoạt Shop & Trở thành Người bán"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
