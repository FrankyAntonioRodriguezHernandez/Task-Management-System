<template>
  <div class="min-h-dvh bg-background text-foreground">
    
    <header
      class="sticky top-0 z-40 border-b bg-white/70 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60"
    >
      <div class="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <h1 class="text-xl font-semibold">Tasks List</h1>

        <div class="ml-auto flex items-center gap-3">
          <!-- Avatares (máx 3 + overflow) -->
          <div class="flex -space-x-2">
            <img
              v-for="u in headerUsers.slice(0,3)"
              :key="u.id"
              :src="u.avatar_url || fallback"
              class="h-8 w-8 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
              :title="u.full_name"
            />
            <div
              v-if="headerUsers.length > 3"
              class="h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center ring-2 ring-white dark:ring-neutral-950"
            >
              +{{ headerUsers.length - 3 }}
            </div>
          </div>

          <!-- Modo oscuro -->
          <button class="px-3 py-1 rounded border" @click="toggleDark">
            {{ isDark ? 'Light' : 'Dark' }}
          </button>

          <!-- Add New -->
          <button
            class="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
            @click="openCreate = true"
          >
            Add New
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-4">
      <NuxtPage />
    </main>

    <!-- Modal Crear -->
    <TaskFormDialog v-model:open="openCreate" />
    <ClientOnly>
      <Toaster position="top-right" rich-colors />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from 'nuxt/app'
import TaskFormDialog from './components/TaskFormDialog.vue'
import { useMetadata } from './composables/useMetadata'

const isDark = ref(false)
useHead(() => ({ htmlAttrs: { class: isDark.value ? 'dark' : undefined } }))
const toggleDark = () => (isDark.value = !isDark.value)

const openCreate = ref(false)

const { users, loadOnce } = useMetadata()
await loadOnce()
const headerUsers = computed(() => users?.value ?? [])
const fallback = 'https://i.pravatar.cc/64'
</script>
