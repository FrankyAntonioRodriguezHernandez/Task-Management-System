<script setup lang="ts">
import { Button } from './ui/button'
import { Sun, Moon, Plus } from 'lucide-vue-next'
const emit = defineEmits<{ (e: 'create'): void }>()
const { isDark, toggle } = useDark()
</script>

<template>
  <header class="flex items-center justify-between py-4">
    <h1 class="text-2xl font-semibold">Tasks List</h1>

    <div class="flex items-center gap-3">
      <!-- Avatares demo (puedes ligarlos a /users si quieres) -->
      <div class="flex -space-x-2">
        <img v-for="n in 3" :key="n" class="h-8 w-8 rounded-full ring-2 ring-background"
             :src="`https://i.pravatar.cc/32?img=${n+3}`" alt="avatar" />
      </div>

      <Button variant="outline" @click="toggle" class="w-10 p-0" :aria-label="isDark ? 'Light' : 'Dark'">
        <Sun v-if="!isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </Button>

      <Button class="bg-emerald-600 hover:bg-emerald-700" @click="emit('create')">
        <Plus class="mr-2 h-4 w-4" /> Add New
      </Button>
    </div>
  </header>
</template>
