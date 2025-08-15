<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '../types'
import { useApi } from '../services/api'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { File, MessageCircleMore, Loader2 } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ (e: 'edit', task: Task): void }>()

const api = useApi()

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

function openEdit() { emit('edit', props.task) }

const attachments = ref<any[]>([])
const loadingAttachments = ref(false)
async function loadAttachments() {
  loadingAttachments.value = true
  try {
    const { data } = await api.get(`/tasks/${props.task.id}/attachments`)
    attachments.value = data
  } finally {
    loadingAttachments.value = false
  }
}

const comments = ref<any[]>([])
const loadingComments = ref(false)
async function loadComments() {
  loadingComments.value = true
  try {
    const { data } = await api.get(`/tasks/${props.task.id}/comments`)
    comments.value = data
  } finally {
    loadingComments.value = false
  }
}
</script>

<template>
  <Card class="relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
    <div class="cursor-pointer" @click="openEdit">
      <CardHeader class="px-4 pt-4 pr-3">
        <CardTitle class="text-base leading-6">{{ props.task.title }}</CardTitle>
      </CardHeader>

      <CardContent class="px-4 pb-2">
        <div v-if="(props.task as any)?.categories?.length" class="flex flex-wrap gap-2">
          <Badge v-for="c in (props.task as any).categories" :key="c.id" variant="secondary" class="border"
            :style="{ backgroundColor: (c.color || '#999') + '22', borderColor: c.color || '#999' }">
            {{ c.name }}
          </Badge>
        </div>
      </CardContent>
    </div>

    <Separator class="mx-4 my-2" />

    <CardFooter class="flex items-center justify-between gap-4 pt-2 px-4 pb-4">
      <div class="text-xs text-muted-foreground font-medium">#{{ props.task.id }}</div>

      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <Popover @open="loadAttachments">
          <PopoverTrigger as-child>
            <button class="flex items-center gap-1 hover:text-foreground">
              <File class="h-4 w-4" />
              <span>{{ (props.task as any)?.attachments_count ?? 0 }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-64 p-3">
            <h4 class="font-medium mb-2 text-sm">Attachments</h4>
            <div v-if="loadingAttachments" class="flex items-center text-sm text-muted-foreground">
              <Loader2 class="h-4 w-4 mr-2 animate-spin" /> Loading…
            </div>
            <div v-else-if="attachments.length === 0" class="text-xs text-muted-foreground">
              No attachments
            </div>
            <div v-else class="space-y-2">
              <div v-for="a in attachments" :key="a.id" class="flex items-center justify-between">
                <a :href="a.url" target="_blank" class="text-sm text-blue-600 hover:underline">
                  {{ a.filename }}
                </a>
                <span class="text-xs text-muted-foreground">{{ (a.size / 1024).toFixed(1) }} KB</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover @open="loadComments">
          <PopoverTrigger as-child>
            <button class="flex items-center gap-1 hover:text-foreground">
              <MessageCircleMore class="h-4 w-4" />
              <span>{{ (props.task as any)?.comments_count ?? 0 }}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent class="w-64 p-3">
            <h4 class="font-medium mb-2 text-sm">Comments</h4>
            <div v-if="loadingComments" class="flex items-center text-sm text-muted-foreground">
              <Loader2 class="h-4 w-4 mr-2 animate-spin" /> Loading…
            </div>
            <div v-else-if="comments.length === 0" class="text-xs text-muted-foreground">
              No comments
            </div>
            <div v-else class="space-y-2">
              <div v-for="c in comments" :key="c.id" class="border-b pb-1">
                <p class="text-xs font-medium">{{ c.user?.full_name }}</p>
                <p class="text-sm">{{ c.body }}</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div class="flex -space-x-2">
        <template v-for="a in displayAssignees" :key="a.id">
          <img :src="a.avatar_url" :alt="a.full_name || ('User #' + a.id)"
            class="h-6 w-6 rounded-full ring-2 ring-background object-cover" />
        </template>
        <div v-if="moreAssignees"
          class="h-6 w-6 rounded-full bg-muted text-[10px] ring-2 ring-background flex items-center justify-center">
          +{{ moreAssignees }}
        </div>
      </div>
    </CardFooter>
  </Card>
</template>
