// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  tailwindcss: {
    cssPath: 'assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    viewer: true,
  },

  typescript: { strict: true },
  runtimeConfig: { public: { apiBase: 'http://localhost:3333' } },
  compatibilityDate: '2025-08-13',
})
