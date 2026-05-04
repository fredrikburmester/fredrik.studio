import { randomBytes, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";

const COOKIE_NAME = "admin_csrf";
const HEADER_NAME = "x-csrf-token";

export const issueCsrfCookie = (event: H3Event): string => {
  const token = randomBytes(32).toString("hex");
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: false,
    secure: !import.meta.dev,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return token;
};

export const requireCsrf = (event: H3Event) => {
  const method = (event.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const cookie = getCookie(event, COOKIE_NAME);
  const header = getHeader(event, HEADER_NAME);

  if (!cookie || !header) {
    throw createError({ statusCode: 403, statusMessage: "CSRF token missing" });
  }
  const a = Buffer.from(cookie);
  const b = Buffer.from(header);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw createError({ statusCode: 403, statusMessage: "CSRF token mismatch" });
  }
};
