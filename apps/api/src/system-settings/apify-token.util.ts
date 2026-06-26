export function normalizeApifyActorId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\//g, '~');
}

export async function verifyApifyApiToken(token: string): Promise<{
  ok: true;
  username: string | null;
}> {
  const response = await fetch('https://api.apify.com/v2/users/me', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (payload.error?.message) {
        detail = payload.error.message;
      }
    } catch {
      // ignore parse errors
    }

    throw new Error(
      response.status === 401 || response.status === 403
        ? `Token Apify tidak valid (${detail})`
        : `Gagal menghubungi Apify (${detail})`,
    );
  }

  const payload = (await response.json()) as {
    data?: { username?: string };
  };

  return {
    ok: true,
    username: payload.data?.username ?? null,
  };
}
