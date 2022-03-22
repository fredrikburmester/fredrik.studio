require('dotenv').config()

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'fredrik.studio',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/firebase.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/dotenv',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        // Add some plugins
        'postcss-import': {},
        'tailwindcss/nesting': {},
      },
    }
  },
  
  image: {
    domains: [
      'imagedelivery.net'
    ],
    alias: {
      cloudflare: 'https://imagedelivery.net/FYZsbuLae8g9R3ZwqoyBKQ/'
    },
    dir: 'static',
  },

  proxy: {
    '/api': { target: 'https://api.cloudflare.com/client/v4/accounts/7adcff2dc8617066b1fe6fb458dbaedf/images/v1', pathRewrite: {'^/api': ''} },
  },

  axios: {
    proxy: true,
  },

  publicRuntimeConfig: {
    
  },
  privateRuntimeConfig: {
    cloudflareToken: process.env.CF_TOKEN,
    firebaseAPIKey: process.env.FB_API_KEY,
  }
  
}
