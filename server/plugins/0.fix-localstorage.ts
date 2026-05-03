if (typeof globalThis.localStorage !== "undefined") {
  const ls = globalThis.localStorage as { getItem?: unknown };
  if (typeof ls.getItem !== "function") {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  }
}

export default defineNitroPlugin(() => {});
