<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../types'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { File, MessageCircleMore } from 'lucide-vue-next'

const props = defineProps<{ task: Task }>()
const emit  = defineEmits<{ (e: 'edit', task: Task): void }>()

const AVATAR_POOL = [
  '/avatars/1.PNG', '/avatars/2.PNG', '/avatars/3.PNG', '/avatars/4.PNG', '/avatars/5.PNG',
]

function resolveAvatar(u: any, idx: number) {
  if (u?.avatar_url) return u.avatar_url
  const seed = Number(u?.id)
  if (Number.isFinite(seed)) return AVATAR_POOL[seed % AVATAR_POOL.length] || AVATAR_POOL[0]
  return AVATAR_POOL[idx % AVATAR_POOL.length] || AVATAR_POOL[0]
}

const displayAssignees = computed(() => {
  const list: any[] = (props.task as any)?.assignees ?? []
  return list.slice(0, 3).map((u, i) => ({
    id: Number(u?.id),
    full_name: u?.full_name ?? u?.email ?? null,
    avatar_url: resolveAvatar(u, i),
  }))
})

const moreAssignees = computed(() => {
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
    <div class="cursor-pointer" @click="openEdit">
      <CardHeader class="px-4 pt-4 pr-3">
        <CardTitle class="text-base leading-6">{{ props.task.title }}</CardTitle>
      </CardHeader>

      <CardContent class="px-4 pb-2">
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
        <template v-for="a in displayAssignees" :key="a.id">
          <img
            :src="a.avatar_url"
            :alt="a.full_name || ('User #' + a.id)"
            class="h-6 w-6 rounded-full ring-2 ring-background object-cover"
          />
        </template>
        <div
          v-if="moreAssignees"
          class="h-6 w-6 rounded-full bg-muted text-[10px] ring-2 ring-background flex items-center justify-center"
        >
          +{{ moreAssignees }}
        </div>
      </div>
    </CardFooter>
  </Card>
</template>
