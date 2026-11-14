import { isCondition, type Condition } from "@/lib/constants";
import type { DiscoveryFilterParams, SortOption } from "./types";

const DEFAULT_DEVICE_IMAGE = "/images/placeholder-device.svg";

/**
 * Từ điển nhãn thông số kỹ thuật tiếng Việt cho bảng specsJson.
 */
export const SPEC_LABELS_VI: Record<string, string> = {
  screen: "Màn hình",
  chip: "Vi xử lý (Chip)",
  cpu: "Bộ vi xử lý (CPU)",
  gpu: "Card đồ hoạ (GPU)",
  ram: "Bộ nhớ RAM",
  storage: "Dung lượng lưu trữ",
  battery: "Dung lượng / Tình trạng Pin",
  connectivity: "Kết nối",
  type: "Kiểu thiết bị",
  anc: "Chống ồn chủ động (ANC)",
  size: "Kích thước",
  strap: "Dây đeo",
  power: "Công suất sạc",
  ports: "Cổng kết nối",
  cable: "Cáp đi kèm",
  os: "Hệ điều hành",
  warranty: "Bảo hành",
  color: "Màu sắc",
};

/**
 * Chuyển khoá thông số kỹ thuật tiếng Anh sang nhãn tiếng Việt dễ đọc.
 */
export function formatSpecLabel(key: string): string {
  const normalized = key.trim().toLowerCase();
  if (SPEC_LABELS_VI[normalized]) {
    return SPEC_LABELS_VI[normalized];
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Giải mã an toàn chuỗi JSON specsJson từ SQLite thành đối tượng key-value.
 */
export function parseSpecsJson(
  specsJson: string | null | undefined,
): Record<string, string> {
  if (!specsJson) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(specsJson);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (v !== null && v !== undefined && String(v).trim() !== "") {
          result[k] = String(v);
        }
      }
      return result;
    }
  } catch {
    // Bỏ qua lỗi JSON không hợp lệ
  }
  return {};
}

/**
 * Giải mã an toàn chuỗi JSON imagesJson từ SQLite thành mảng URL ảnh.
 */
export function parseImagesJson(
  imagesJson: string | null | undefined,
): string[] {
  if (!imagesJson) {
    return [DEFAULT_DEVICE_IMAGE];
  }
  try {
    const parsed: unknown = JSON.parse(imagesJson);
    if (Array.isArray(parsed)) {
      const validUrls = parsed.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );
      if (validUrls.length > 0) {
        return validUrls;
      }
    }
  } catch {
    // Bỏ qua lỗi JSON không hợp lệ
  }
  return [DEFAULT_DEVICE_IMAGE];
}

function getFirstString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]?.trim();
    return first && first.length > 0 ? first : undefined;
  }
  return undefined;
}

function parseNonNegativeInt(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const num = Number(raw);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.floor(num);
}

/**
 * Chuẩn hoá tham số tìm kiếm & lọc từ URL searchParams.
 * Đảm bảo an toàn kiểu dữ liệu, chặn số âm hoặc tham số rác.
 */
export function normalizeDiscoverySearchParams(
  raw: Record<string, string | string[] | undefined>,
): DiscoveryFilterParams {
  const q = getFirstString(raw.q);
  const category = getFirstString(raw.category);
  const brand = getFirstString(raw.brand);

  const rawCondition = getFirstString(raw.condition);
  const condition: Condition | undefined =
    rawCondition && isCondition(rawCondition) ? rawCondition : undefined;

  let minPrice = parseNonNegativeInt(getFirstString(raw.minPrice));
  let maxPrice = parseNonNegativeInt(getFirstString(raw.maxPrice));

  // Nếu người dùng nhập minPrice > maxPrice thì tự động hoán đổi để không lỗi truy vấn
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    const temp = minPrice;
    minPrice = maxPrice;
    maxPrice = temp;
  }

  const rawAllowExchange = getFirstString(raw.allowExchange);
  const allowExchange =
    rawAllowExchange === "true" || rawAllowExchange === "1" ? true : undefined;

  const rawSort = getFirstString(raw.sort);
  const sort: SortOption =
    rawSort === "price_asc" || rawSort === "price_desc" ? rawSort : "newest";

  const rawPage = Number(getFirstString(raw.page) ?? "1");
  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const rawLimit = Number(getFirstString(raw.limit) ?? "9");
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 48)
      : 9;

  return {
    q,
    category,
    brand,
    condition,
    minPrice,
    maxPrice,
    allowExchange,
    sort,
    page,
    limit,
  };
}

/**
 * Chuyển bộ lọc hiện tại thành đối tượng query string để truyền cho Pagination hoặc Link.
 */
export function serializeDiscoverySearchParams(
  filters: Partial<DiscoveryFilterParams>,
): Record<string, string | undefined> {
  return {
    q: filters.q,
    category: filters.category,
    brand: filters.brand,
    condition: filters.condition,
    minPrice:
      filters.minPrice !== undefined ? String(filters.minPrice) : undefined,
    maxPrice:
      filters.maxPrice !== undefined ? String(filters.maxPrice) : undefined,
    allowExchange: filters.allowExchange ? "true" : undefined,
    sort: filters.sort && filters.sort !== "newest" ? filters.sort : undefined,
  };
}
