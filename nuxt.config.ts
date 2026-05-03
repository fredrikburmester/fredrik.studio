const blobBaseUrl = process.env.NUXT_PUBLIC_BLOB_BASE_URL;
const blobDomain = blobBaseUrl ? new URL(blobBaseUrl).host : undefined;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-09-28",
  srcDir: "app/",
  devtools: { enabled: false },
  modules: ["@nuxt/image", "@nuxt/ui", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  colorMode: {
    preference: "light",
  },
  plugins: [
    { src: "~/plugins/vercel.ts", mode: "client" },
    { src: "~/plugins/tanstack-query.client.ts", mode: "client" },
  ],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  runtimeConfig: {
    uploadPassword: process.env.UPLOAD_PASSWORD,
    public: {
      blobBaseUrl: blobBaseUrl || "",
    },
  },
  image: {
    domains: ["cdn.fredrik.studio", ...(blobDomain ? [blobDomain] : [])],
  },
});
