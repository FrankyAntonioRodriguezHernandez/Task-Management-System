import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', 'shadcn-nuxt'], // Nombre exacto del módulo
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  alias: {
    '~/': fileURLToPath(new URL('./', import.meta.url)),
    '@/': fileURLToPath(new URL('./', import.meta.url)),
    '~~/': fileURLToPath(new URL('./', import.meta.url)),
    '@@/': fileURLToPath(new URL('./', import.meta.url)),
    'assets': fileURLToPath(new URL('./assets', import.meta.url)),
    'public': fileURLToPath(new URL('./public', import.meta.url))
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  app: { head: { title: 'Tasks List' } },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3333'
    }
  }
})