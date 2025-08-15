<script setup lang="ts">
import type { Task } from '../types'
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { MessageSquare, Paperclip } from 'lucide-vue-next'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
  (e: 'open', payload: { task: Task; tab?: 'details' | 'comments' | 'attachments' }): void
}>()

const assignees = computed(() => (props.task.assignees ?? []).slice(0, 3))

function openDetails() {
  emit('open', { task: props.task, tab: 'details' })
}
function openComments(ev: MouseEvent) {
  ev.stopPropagation()
  emit('open', { task: props.task, tab: 'comments' })
}
function openAttachments(ev: MouseEvent) {
  ev.stopPropagation()
  emit('open', { task: props.task, tab: 'attachments' })
}
</script>

<template>
  <Card class="relative overflow-hidden cursor-pointer transition hover:shadow-md" @click="openDetails">
    <CardHeader>
      <CardTitle class="pr-10">{{ task.title }}</CardTitle>
    </CardHeader>

    <CardContent class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="c in task.categories"
          :key="c.id"
          variant="secondary"
          class="border"
          :style="{ backgroundColor: c.color + '22', borderColor: c.color }"
        >
          {{ c.name }}
        </Badge>
      </div>
    </CardContent>

    <CardFooter class="flex items-center justify-between">
      <div class="flex items-center gap-4 text-muted-foreground">
        <button class="flex items-center gap-1 hover:opacity-80" @click="openComments">
          <MessageSquare class="h-4 w-4" />
          <span class="text-xs">{{ task.comments_count ?? 0 }}</span>
        </button>
        <button class="flex items-center gap-1 hover:opacity-80" @click="openAttachments">
          <Paperclip class="h-4 w-4" />
          <span class="text-xs">{{ task.attachments_count ?? 0 }}</span>
        </button>
      </div>

      <div class="flex -space-x-2">
        <img
          v-for="u in assignees"
          :key="u.id"
          :src="u.avatar_url || ('https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(u.full_name))"
          :alt="u.full_name"
          class="h-6 w-6 rounded-full ring-2 ring-white object-cover"
        />
      </div>
    </CardFooter>
  </Card>
</template>
