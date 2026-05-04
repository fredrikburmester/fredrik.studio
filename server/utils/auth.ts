import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

type SessionPayload = {
  iat: number;
  exp: number;
  nonce: string;
  authEpoch: string;
};

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

const fromB64url = (s: string) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

const getSecret = () => {
  const secret = useRuntimeConfig().sessionSecret;
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: "SESSION_SECRET is not configured (need 32+ chars)",
    });
  }
  return secret;
};

const getAuthEpoch = () => String(useRuntimeConfig().authEpoch ?? "1");

const sign = (data: string, secret: string) =>
  b64url(createHmac("sha256", secret).update(data).digest());

export const issueSessionCookie = (event: H3Event) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: b64url(randomBytes(16)),
    authEpoch: getAuthEpoch(),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = sign(body, getSecret());
  const cookie = `${body}.${sig}`;
  setCookie(event, COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = (event: H3Event) => {
  setCookie(event, COOKIE_NAME, "", {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
};

const verifyCookie = (cookie: string | undefined): SessionPayload | null => {
  if (!cookie) return null;
  const [body, sig] = cookie.split(".");
  if (!body || !sig) return null;
  const expected = sign(body, getSecret());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    if (payload.authEpoch !== getAuthEpoch()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const getAdminSession = (event: H3Event): SessionPayload | null => {
  const cookie = getCookie(event, COOKIE_NAME);
  return verifyCookie(cookie);
};

export const isAuthenticated = (event: H3Event): boolean =>
  getAdminSession(event) !== null;

export const requireAdmin = (event: H3Event): SessionPayload => {
  const session = getAdminSession(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return session;
};

export const verifyPassword = (provided: string): boolean => {
  const expected = useRuntimeConfig().uploadPassword;
  if (!expected || typeof expected !== "string") return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};
