<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
defineProps<{
  title: string
  colorDot: string
  tasks: Task[]
  count: number
}>()
</script>

<template>
  <section class="w-full sm:w-80">
    <header class="flex items-center gap-2 mb-3">
      <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colorDot }" />
      <h2 class="font-medium">{{ title }}</h2>
      <span class="ml-1 text-xs text-muted-foreground"> {{ count }} </span>
    </header>

    <div class="space-y-3">
      <TaskCard v-for="t in tasks" :key="t.id" :task="t" />
    </div>
  </section>
</template>
