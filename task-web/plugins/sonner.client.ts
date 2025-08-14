import { defineNuxtPlugin } from 'nuxt/app'
import { Toaster } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster)
})
