import { isValidPhoneNumber } from "@/features/auth/phone";
import {
  SHOP_BANNER_THEMES,
  SHOP_BANNER_THEME_VALUES,
  type ShopBannerTheme,
} from "@/lib/constants";
import { ShopError } from "./errors";
import type { ShopUpsertInput } from "./types";

/** Chuyển tên Shop tiếng Việt có dấu thành slug URL sạch. */
export function slugifyShopName(rawName: string): string {
  return rawName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function isBannerTheme(value: unknown): value is ShopBannerTheme {
  return (
    typeof value === "string" &&
    (SHOP_BANNER_THEME_VALUES as string[]).includes(value)
  );
}

function cleanOptionalText(
  value: unknown,
  fieldLabel: string,
  maxLength: number,
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ShopError("VALIDATION_ERROR", `${fieldLabel} không hợp lệ.`, 400);
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    throw new ShopError(
      "VALIDATION_ERROR",
      `${fieldLabel} không được vượt quá ${maxLength} ký tự.`,
      400,
    );
  }
  return trimmed;
}

/** Đọc và kiểm tra dữ liệu tạo mới hoặc cập nhật Shop. */
export async function readShopInput(
  request: Request,
): Promise<ShopUpsertInput> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ShopError("VALIDATION_ERROR", "Nội dung JSON không hợp lệ.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ShopError("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", 400);
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 3 || name.length > 60) {
    throw new ShopError(
      "VALIDATION_ERROR",
      "Tên Shop cần từ 3 đến 60 ký tự.",
      400,
    );
  }

  let slug: string | undefined;
  if (input.slug !== undefined && input.slug !== null && String(input.slug).trim() !== "") {
    if (typeof input.slug !== "string") {
      throw new ShopError("VALIDATION_ERROR", "Đường dẫn Shop (slug) không hợp lệ.", 400);
    }
    const normalizedSlug = input.slug.trim().toLowerCase();
    if (normalizedSlug.length < 3 || normalizedSlug.length > 60 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      throw new ShopError(
        "VALIDATION_ERROR",
        "Đường dẫn Shop chỉ gồm chữ thường a-z, số và dấu gạch ngang (3–60 ký tự).",
        400,
      );
    }
    slug = normalizedSlug;
  }

  const cityRaw = typeof input.city === "string" ? input.city.trim() : "";
  const city = cityRaw || "Hà Nội";
  if (city.length < 2 || city.length > 60) {
    throw new ShopError(
      "VALIDATION_ERROR",
      "Khu vực / Tỉnh thành cần từ 2 đến 60 ký tự.",
      400,
    );
  }

  const tagline = cleanOptionalText(input.tagline, "Khẩu hiệu Shop", 140);
  const description = cleanOptionalText(input.description, "Mô tả Shop", 1000);
  const address = cleanOptionalText(input.address, "Địa chỉ giao dịch", 200);

  let contactPhone: string | null = null;
  if (input.contactPhone !== undefined && input.contactPhone !== null) {
    if (typeof input.contactPhone !== "string") {
      throw new ShopError("VALIDATION_ERROR", "Số điện thoại Shop không hợp lệ.", 400);
    }
    const trimmedPhone = input.contactPhone.trim();
    if (trimmedPhone) {
      if (!isValidPhoneNumber(trimmedPhone)) {
        throw new ShopError("VALIDATION_ERROR", "Số điện thoại Shop không hợp lệ.", 400);
      }
      contactPhone = trimmedPhone;
    }
  }

  let bannerTheme: ShopBannerTheme = SHOP_BANNER_THEMES.INDIGO;
  if (input.bannerTheme !== undefined && input.bannerTheme !== null && input.bannerTheme !== "") {
    if (!isBannerTheme(input.bannerTheme)) {
      throw new ShopError("VALIDATION_ERROR", "Màu chủ đề Shop không hợp lệ.", 400);
    }
    bannerTheme = input.bannerTheme;
  }

  let avatarUrl: string | null | undefined = undefined;
  if (input.avatarUrl !== undefined) {
    if (input.avatarUrl === null || input.avatarUrl === "") {
      avatarUrl = null;
    } else if (typeof input.avatarUrl === "string") {
      const trimmedAvatar = input.avatarUrl.trim();
      const isValidImageDataUrl =
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(
          trimmedAvatar,
        );
      if (!isValidImageDataUrl) {
        throw new ShopError(
          "VALIDATION_ERROR",
          "Ảnh đại diện Shop chỉ hỗ trợ định dạng PNG, JPG, WebP hoặc GIF.",
          400,
        );
      }
      if (trimmedAvatar.length > 450_000) {
        throw new ShopError(
          "VALIDATION_ERROR",
          "Ảnh đại diện Shop sau khi xử lý vượt quá dung lượng cho phép (~300KB).",
          400,
        );
      }
      avatarUrl = trimmedAvatar;
    } else {
      throw new ShopError("VALIDATION_ERROR", "Ảnh đại diện Shop không hợp lệ.", 400);
    }
  }

  return {
    name,
    slug,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    tagline,
    description,
    city,
    address,
    contactPhone,
    bannerTheme,
  };
}
