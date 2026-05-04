import { clearSessionCookie } from "../../utils/auth";

export default defineEventHandler((event) => {
  clearSessionCookie(event);
  setCookie(event, "admin_csrf", "", { maxAge: 0, path: "/" });
  return { ok: true };
});
