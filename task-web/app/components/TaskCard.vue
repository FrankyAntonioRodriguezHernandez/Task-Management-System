<script setup lang="ts">
import type { Task } from '../types'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { File, MessageCircleMore } from 'lucide-vue-next'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ (e: 'edit', task: Task): void }>()

const firstAssignees = computed(() => (props.task as any)?.assignees?.slice(0, 3) ?? [])
const moreAssigneesCount = computed(() => {
  const total = (props.task as any)?.assignees?.length ?? 0
  return total > 3 ? total - 3 : 0
})
const categoryBadgeStyle = (c: any) => {
  const color = c?.color || ''
  return color ? `bg-[${color}] text-white` : 'bg-muted text-foreground'
}
function openEdit() { emit('edit', props.task) }
</script>

<template>
  <Card class="relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
    <!-- Clickable area: header + content (abre editor) -->
    <div class="cursor-pointer" @click="openEdit">
      <CardHeader class="px-4 pt-4 pr-12">
        <div class="flex items-start justify-between gap-2">
          <CardTitle class="text-base leading-6">
            {{ props.task.title }}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent class="px-4 pb-2">
        <!-- Category tags -->
        <div v-if="(props.task as any)?.categories?.length" class="flex flex-wrap gap-2">
          <Badge
            v-for="c in (props.task as any).categories"
            :key="c.id"
            variant="outline"
            :class="categoryBadgeStyle(c)"
            class="px-2 py-0.5 text-xs"
          >
            {{ c.name }}
          </Badge>
        </div>
      </CardContent>
    </div>

    <Separator class="mx-4 my-2" />

    <!-- Footer (no abre editor) -->
    <CardFooter class="flex items-center justify-between gap-4 pt-2 px-4 pb-4">
      <div class="text-xs text-muted-foreground font-medium">#{{ props.task.id }}</div>

      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <File class="h-4 w-4" />
          <span>{{ (props.task as any)?.attachments_count ?? 0 }}</span>
        </div>
        <div class="flex items-center gap-1">
          <MessageCircleMore class="h-4 w-4" />
          <span>{{ (props.task as any)?.comments_count ?? 0 }}</span>
        </div>
      </div>

      <div class="flex -space-x-2">
        <template v-for="a in firstAssignees" :key="a.id">
          <img
            v-if="a.avatar_url"
            :src="a.avatar_url"
            :alt="a.full_name"
            class="h-6 w-6 rounded-full ring-2 ring-background object-cover"
          />
          <div
            v-else
            class="h-6 w-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] uppercase"
          >
            {{ a.full_name?.slice(0,2) }}
          </div>
        </template>
        <div
          v-if="moreAssigneesCount"
          class="h-6 w-6 rounded-full bg-muted text-[10px] ring-2 ring-background flex items-center justify-center"
        >
          +{{ moreAssigneesCount }}
        </div>
      </div>
    </CardFooter>
  </Card>
</template>
