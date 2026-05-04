import { requireAdmin } from "../../utils/auth";
import { issueCsrfCookie } from "../../utils/csrf";

export default defineEventHandler((event) => {
  requireAdmin(event);
  const csrfToken = issueCsrfCookie(event);
  return { csrfToken };
});
