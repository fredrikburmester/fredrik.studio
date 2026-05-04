import { issueSessionCookie, verifyPassword } from "../../utils/auth";
import { issueCsrfCookie } from "../../utils/csrf";
import { rateLimit } from "../../utils/rate-limit";

export default defineEventHandler(async (event) => {
  rateLimit(event, "admin-login", 5, 15 * 60 * 1000);

  const body = await readBody<{ password?: string }>(event);
  const password = body?.password;

  if (typeof password !== "string" || password.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Password required" });
  }

  if (!verifyPassword(password)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid password" });
  }

  issueSessionCookie(event);
  const csrfToken = issueCsrfCookie(event);

  return { ok: true, csrfToken };
});
