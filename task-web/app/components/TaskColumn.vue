<script setup lang="ts">
import TaskCard from './TaskCard.vue'
import type { Task } from '../types'

const props = defineProps<{
  title: string
  color: string
  tasks: Task[] | { value: Task[] }
}>()

const emit = defineEmits<{ (e: 'edit', task: Task): void }>()
function handleEdit(t: Task) { emit('edit', t) }

const list = computed<Task[]>(() =>
  Array.isArray((props.tasks as any)?.value)
    ? (props.tasks as any).value
    : (props.tasks as Task[])
)
</script>

<template>
  <div class="rounded-xl bg-gray-100 dark:bg-gray-900 p-3">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span :class="['h-2.5 w-2.5 rounded-full', color]" />
        <h2 class="text-sm font-semibold">{{ title }}</h2>
        <span class="rounded-full bg-muted px-2 py-0.5 text-xs">{{ list.length }}</span>
      </div>
    </div>

    <div class="space-y-3">
      <TaskCard v-for="t in list" :key="t.id" :task="t" @edit="handleEdit" />
    </div>
  </div>
</template>
