<script setup lang="ts">
import type { Task } from '../types'
import { computed } from 'vue'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ (e: 'edit', task: Task): void }>()

const initials = computed(() =>
  (props.task.assignees || []).slice(0, 3).map(a => a.full_name.split(' ').map(p => p[0]).join('').slice(0,2))
)
</script>

<template>
  <div class="rounded-xl border p-3 bg-card text-card-foreground hover:shadow-sm transition">
    <div class="font-medium mb-2">{{ task.title }}</div>

    <div class="flex flex-wrap gap-2 mb-3">
      <span
        v-for="c in task.categories"
        :key="c.id"
        class="px-2 py-0.5 text-xs rounded-full border"
        :style="{ backgroundColor: c.color + '22', color: c.color }"
      >
        {{ c.name }}
      </span>
    </div>

    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <div class="flex items-center gap-3">
        <span>#{{ task.id }}</span>
        <span class="inline-flex items-center gap-1">
          <i class="i-lucide-message-square w-4 h-4" />
          {{ task.comments_count ?? 0 }}
        </span>
        <span class="inline-flex items-center gap-1">
          <i class="i-lucide-paperclip w-4 h-4" />
          {{ task.attachments_count ?? 0 }}
        </span>
      </div>

      <div class="flex -space-x-2">
        <div
          v-for="(ini, i) in initials"
          :key="i"
          class="h-7 w-7 rounded-full bg-primary/10 text-primary border flex items-center justify-center text-[10px]"
          :title="task.assignees[i]?.full_name"
        >
          {{ ini }}
        </div>
      </div>
    </div>

    <button class="mt-3 text-xs underline" @click="emit('edit', task)">Edit</button>
  </div>
</template>
