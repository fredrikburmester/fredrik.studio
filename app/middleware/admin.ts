export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/admin/login") return;

  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  try {
    const session = await $fetch<{ authenticated: boolean }>(
      "/api/admin/session",
      { headers },
    );
    if (!session.authenticated) {
      return navigateTo({
        path: "/admin/login",
        query: { redirect: to.fullPath },
      });
    }
  } catch {
    return navigateTo({
      path: "/admin/login",
      query: { redirect: to.fullPath },
    });
  }
});
