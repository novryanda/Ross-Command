import { ApiRequestError, type ApiError, type ApiSuccess } from "./types";

type ClientApiOptions = RequestInit & {
  parseJson?: boolean;
};

export async function clientApiFetch<T>(path: string, options: ClientApiOptions = {}): Promise<ApiSuccess<T>> {
  const { parseJson = true, ...init } = options;
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new ApiRequestError("Sesi tidak valid. Silakan login kembali.", 401, "UNAUTHORIZED");
  }

  if (!parseJson) {
    return { success: true, data: undefined as T, timestamp: new Date().toISOString() };
  }

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok || !payload || payload.success === false) {
    const apiError = payload && "error" in payload ? payload.error : undefined;
    throw new ApiRequestError(
      apiError?.message ?? "Request gagal diproses",
      response.status,
      apiError?.code,
      apiError?.details,
    );
  }

  return payload;
}

export function buildQueryString(params: Record<string, unknown>) {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }

  return qs.toString();
}
