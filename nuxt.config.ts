// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxthq/ui"],
  colorMode: {
    preference: "light",
  },
  plugins: [{ src: '~/plugins/vercel.ts', mode: 'client' }],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
});
