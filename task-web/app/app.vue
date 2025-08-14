<template>
  <div class="min-h-screen grid place-items-center bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
    <div class="space-y-4 text-center">
      <h1 class="text-3xl font-bold">Tailwind v4 + Nuxt ✅</h1>
      <button
        class="px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        @click="isDark = !isDark"
      >
        Toggle Dark
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const isDark = useState('isDark', () => false)

useHead(() => ({
  htmlAttrs: {
    class: isDark.value ? 'dark' : undefined,
  },
}))
</script>
