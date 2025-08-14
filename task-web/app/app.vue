<template>
  <div class="min-h-dvh bg-background text-foreground">
    <header class="border-b p-4 flex items-center gap-3">
      <h1 class="text-xl font-semibold">Tasks List</h1>

      <div class="ml-auto flex items-center gap-2">
        <!-- Avatares del equipo (dummy o de metadata) -->
        <div class="flex -space-x-2">
          <img v-for="u in headerUsers" :key="u.id" :src="u.avatar_url || 'https://i.pravatar.cc/32'"
               class="h-8 w-8 rounded-full border" :title="u.full_name" />
        </div>

        <!-- Switch Dark Mode -->
        <button class="px-3 py-1 rounded border" @click="toggleDark">
          {{ isDark ? 'Light' : 'Dark' }}
        </button>

        <!-- Botón Add New -->
        <button class="px-3 py-1 rounded bg-green-600 text-white" @click="openCreate = true">Add New</button>
      </div>
    </header>

    <main class="p-4">
      <NuxtPage />
      <SonnerToaster position="top-right" />
    </main>

    <TaskFormDialog v-model:open="openCreate" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from 'nuxt/app'
import TaskFormDialog from './components/TaskFormDialog.vue'
import { useMetadata } from './composables/useMetadata'

const isDark = ref(false)
useHead(() => ({ htmlAttrs: { class: isDark.value ? 'dark' : undefined } }))
function toggleDark() { isDark.value = !isDark.value }

const openCreate = ref(false)

// carga usuarios para avatares del header
const { users, loadOnce } = useMetadata()
await loadOnce()
const headerUsers = computed(() => (users?.value || []).slice(0, 4))
</script>
