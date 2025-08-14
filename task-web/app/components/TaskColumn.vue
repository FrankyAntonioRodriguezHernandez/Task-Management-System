<script setup lang="ts">
import type { Task, TaskStatus } from '../types'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  title: string
  colorClass: string
  tasks: Task[]
}>()

const emit = defineEmits<{ (e: 'edit', task: Task): void }>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <span :class="['h-2 w-2 rounded-full', colorClass]" />
      <h2 class="font-semibold">{{ title }}</h2>
      <span class="ml-auto text-xs text-muted-foreground">{{ tasks.length }}</span>
    </div>

    <div class="space-y-3">
      <TaskCard v-for="t in tasks" :key="t.id" :task="t" @edit="(task) => emit('edit', task)" />
    </div>
  </div>
</template>
