import { isCondition, isListingStatus } from "@/lib/constants";
import { getPagination } from "@/lib/api-response";
import { ListingError } from "./errors";
import type { ListingInput } from "./types";

function invalid(message: string): never {
  throw new ListingError("VALIDATION_ERROR", message, 400);
}

function readString(value: unknown, label: string, min = 1, max = Infinity): string {
  if (typeof value !== "string") invalid(`${label} phải là chuỗi ký tự.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    invalid(`${label} cần ${max === Infinity ? `ít nhất ${min}` : `từ ${min} đến ${max}`} ký tự.`);
  }
  return normalized;
}

function optionalString(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") invalid(`${label} phải là chuỗi ký tự hoặc null.`);
  return value.trim() || null;
}

function readJson(value: unknown, field: "specsJson" | "imagesJson"): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") invalid(`${field} phải là chuỗi JSON hoặc null.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    invalid(`${field} không phải chuỗi JSON hợp lệ.`);
  }
  if (field === "specsJson") {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
      || Object.values(parsed).some((item: unknown) =>
        !["string", "number", "boolean"].includes(typeof item))) {
      invalid("Thông số phải là object JSON với giá trị chuỗi, số hoặc boolean.");
    }
  } else if (!Array.isArray(parsed) || parsed.some((item: unknown) => !isImagePath(item))) {
    invalid("Ảnh phải là mảng JSON các đường dẫn nội bộ hoặc URL http/https hợp lệ.");
  }
  return JSON.stringify(parsed);
}

function isImagePath(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()
    || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateListingInput(body: unknown, partial: true): Partial<ListingInput>;
export function validateListingInput(body: unknown, partial?: false): ListingInput;
export function validateListingInput(body: unknown, partial = false): Partial<ListingInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) invalid("Dữ liệu tin đăng không hợp lệ.");
  const input = body as Record<string, unknown>;
  const result: Partial<ListingInput> = {};
  if (!partial || "title" in input) result.title = readString(input.title, "Tiêu đề", 5, 120);
  if (!partial || "description" in input) result.description = readString(input.description, "Mô tả", 10);
  if (!partial || "price" in input) {
    if (typeof input.price !== "number" || !Number.isInteger(input.price)
      || input.price <= 0 || input.price > 2_147_483_647) {
      invalid("Giá phải là số nguyên từ 1 đến 2.147.483.647 VNĐ.");
    }
    result.price = input.price;
  }
  if (!partial || "condition" in input) {
    if (typeof input.condition !== "string" || !isCondition(input.condition)) invalid("Tình trạng thiết bị không hợp lệ.");
    result.condition = input.condition;
  }
  if (!partial || "categoryId" in input) result.categoryId = readString(input.categoryId, "Danh mục");
  if (!partial || "brandId" in input) result.brandId = optionalString(input.brandId, "Thương hiệu");
  if (!partial || "specsJson" in input) result.specsJson = readJson(input.specsJson, "specsJson");
  if (!partial || "imagesJson" in input) result.imagesJson = readJson(input.imagesJson, "imagesJson");
  if (!partial || "allowExchange" in input) {
    if (input.allowExchange !== undefined && typeof input.allowExchange !== "boolean") invalid("Nhận trao đổi phải là boolean.");
    result.allowExchange = input.allowExchange ?? false;
  }
  if (!partial || "exchangePreference" in input) {
    result.exchangePreference = optionalString(input.exchangePreference, "Mong muốn trao đổi");
  }
  if (!partial && !result.allowExchange) result.exchangePreference = null;
  // Chỉ ghi các trường nội dung; sellerId, status và id của client không được sử dụng.
  if (partial && Object.keys(result).length === 0) invalid("Cần ít nhất một trường nội dung để cập nhật.");
  return result;
}

export async function readListingBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    invalid("Nội dung JSON không hợp lệ.");
  }
}

export function getSellerListingFilters(params: URLSearchParams) {
  const status = params.get("status") || undefined;
  if (status && !isListingStatus(status)) invalid("Trạng thái tin đăng không hợp lệ.");
  const pagination = getPagination(params);
  // Helper chung có thể làm tròn số dương nhỏ hơn 1 về 0; giữ phân trang từ 1.
  const page = Math.max(1, pagination.page);
  const limit = Math.max(1, pagination.limit);
  if (!Number.isSafeInteger(page * limit)) invalid("Trang phân trang quá lớn.");
  return { page, limit, skip: (page - 1) * limit, status: status && isListingStatus(status) ? status : undefined };
}
