const CSRF_COOKIE = "admin_csrf";

const readCsrfCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]+)`),
  );
  return match && match[1] ? decodeURIComponent(match[1]) : null;
};

const ensureCsrfToken = async (): Promise<string> => {
  const existing = readCsrfCookie();
  if (existing) return existing;
  const res = await $fetch<{ csrfToken: string }>("/api/admin/csrf");
  return res.csrfToken;
};

type AdminFetchInit = NonNullable<Parameters<typeof $fetch>[1]>;

export const useAdminFetch = () => {
  const adminFetch = async <T>(
    url: string,
    init: AdminFetchInit = {},
  ): Promise<T> => {
    const method = (init.method || "GET").toString().toUpperCase();
    const needsCsrf = method !== "GET" && method !== "HEAD";

    const headers: Record<string, string> = {
      ...((init.headers as Record<string, string>) || {}),
    };

    if (needsCsrf) {
      const token = await ensureCsrfToken();
      headers["X-CSRF-Token"] = token;
    }

    return (await $fetch(url, {
      ...init,
      headers,
    })) as T;
  };

  const logout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" });
    await navigateTo("/admin/login");
  };

  return { adminFetch, logout };
};
