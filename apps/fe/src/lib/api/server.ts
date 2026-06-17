import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ApiRequestError, type ApiError, type ApiSuccess, type Me } from "./types";

const API_BASE_URL = process.env.API_INTERNAL_BASE_URL ?? "http://localhost:3001";

type ServerApiOptions = RequestInit & {
  allowUnauthorized?: boolean;
};

export async function serverApiFetch<T>(path: string, options: ServerApiOptions = {}): Promise<ApiSuccess<T>> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  const { allowUnauthorized = false, ...init } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && !allowUnauthorized) {
    redirect("/login");
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

export async function getMe() {
  const response = await serverApiFetch<Me>("/api/v1/auth/me");
  return response.data;
}
