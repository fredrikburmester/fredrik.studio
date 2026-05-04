import { requireAdmin } from "../../../utils/auth";
import { requireCsrf } from "../../../utils/csrf";
import type { ReturnItem, ReturnType } from "~/types";
import {
  ConcurrencyError,
  getAlbumMetaWithVersion,
  writeAlbumMeta,
} from "../../../utils/blob-storage";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  requireCsrf(event);

  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug required" });
  }

  const body = await readBody<{
    order?: string[];
    baseVersion?: { path: string; timestamp: number } | null;
  }>(event);

  const order = Array.isArray(body?.order) ? body.order : [];
  if (order.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Order array required" });
  }

  const { items, version } = await getAlbumMetaWithVersion(slug);
  const baseVersion = body?.baseVersion ?? version;

  if (order.length !== items.length) {
    throw createError({
      statusCode: 409,
      statusMessage: "Order length does not match current image set",
    });
  }

  const byName = new Map<string, ReturnItem>(
    items.map((i: ReturnItem) => [i.name, i] as const),
  );
  const next: ReturnType = [];
  for (const name of order) {
    const item = byName.get(name);
    if (!item) {
      throw createError({
        statusCode: 409,
        statusMessage: `Unknown image in order: ${name}`,
      });
    }
    next.push(item);
  }

  try {
    const newVersion = await writeAlbumMeta(slug, next, baseVersion);
    return { ok: true, version: newVersion };
  } catch (err) {
    if (err instanceof ConcurrencyError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});
