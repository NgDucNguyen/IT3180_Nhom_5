type ApiResult<T> = { data: T; error?: never } | {
  data?: never;
  error: { code: string; message: string };
};

export async function listingApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json() as ApiResult<T>;
  if (!response.ok || body.error) {
    throw new Error(body.error?.message ?? "Không thể xử lý yêu cầu. Vui lòng thử lại.");
  }
  return body.data;
}
