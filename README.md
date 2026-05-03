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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (server-side writes) |
| `NUXT_PUBLIC_BLOB_BASE_URL` | Public URL of the Blob store, e.g. `https://<store-id>.public.blob.vercel-storage.com` |
| `UPLOAD_PASSWORD` | Password for `/upload` admin actions |

## Admin upload

`/upload` is a password-gated dashboard for creating albums, uploading images, setting cover images, and promoting albums to the home page.

## Layout

- `app/pages/` — public pages (`index`, `[album]`, `contact`, `upload`)
- `app/components/` — gallery, lightbox, navbar, upload UI
- `server/api/albums/` — CRUD endpoints
- `server/utils/blob-storage.ts` — JSON-on-Blob helpers (read + mutate album collection and per-album image metadata)
- `server/utils/blob.ts` — thin wrapper around `@vercel/blob`
- `server/utils/uploader.ts` — image processing + upload pipeline
