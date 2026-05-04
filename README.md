# fredrik.studio

My photography portfolio, built with Nuxt and hosted on Vercel.

## Stack

- **Nuxt 4** (pinned to ~4.1.3)
- **Node** runtime, **pnpm** package manager
- **Vercel Blob** for image files _and_ album/image metadata (JSON)
- **Sharp** for image processing (original + 800px thumbnail + 24px LQIP)
- **TanStack Query** + **Pinia** for client state
- **Nuxt UI** + **Tailwind**

There is no database. Album and image metadata live as versioned JSON files inside the Blob store next to the photos themselves.

## Getting started

```sh
pnpm install
pnpm run dev
```

The app expects these env vars in `.env`:

| Variable | Purpose |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (server-side writes + client upload tokens) |
| `NUXT_PUBLIC_BLOB_BASE_URL` | Public URL of the Blob store, e.g. `https://<store-id>.public.blob.vercel-storage.com` |
| `UPLOAD_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | High-entropy HMAC secret for admin session cookies (32+ random bytes hex) |
| `AUTH_EPOCH` | Integer; bump to invalidate all live admin cookies (default `1`) |

## Admin

`/admin` is a password-gated dashboard for creating albums, uploading images, setting cover images, reordering, and promoting albums to the home page.

Auth is a stateless signed cookie (`SESSION_SECRET` HMAC). Bump `AUTH_EPOCH` to revoke all sessions immediately. Originals upload directly browser-to-Blob (bypassing Vercel's 4.5MB function payload limit); the server fetches them back to generate the 800px JPEG thumbnail and 24px LQIP via Sharp.

Slugs are immutable once an album is created (so renames never split metadata across paths). Title, description, cover, and promoted state are editable.

## Layout

- `app/pages/` — public pages (`index`, `[album]`, `contact`, `upload`)
- `app/components/` — gallery, lightbox, navbar, upload UI
- `server/api/albums/` — CRUD endpoints
- `server/utils/blob-storage.ts` — JSON-on-Blob helpers (read + mutate album collection and per-album image metadata)
- `server/utils/blob.ts` — thin wrapper around `@vercel/blob`
- `server/utils/uploader.ts` — image processing + upload pipeline
