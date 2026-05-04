import type { H3Event } from "h3";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 1000;

const getClientIp = (event: H3Event): string => {
  const fwd = getHeader(event, "x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return getHeader(event, "x-real-ip") || event.node?.req?.socket?.remoteAddress || "unknown";
};

const evictIfFull = () => {
  if (buckets.size <= MAX_KEYS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
  if (buckets.size > MAX_KEYS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey) buckets.delete(firstKey);
  }
};

export const rateLimit = (
  event: H3Event,
  scope: string,
  limit: number,
  windowMs: number,
) => {
  const ip = getClientIp(event);
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    evictIfFull();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: { retryAfter },
    });
  }
};
