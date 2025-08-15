<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Task } from '../types'
import { useApi } from '../services/api'
import { useTasksStore } from '../stores/tasks'

import { Button } from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '../components/ui/alert-dialog'

import { ArrowLeft, Undo2, MessageSquare, Paperclip, Loader2 } from 'lucide-vue-next'

type DeletedTask = Task & { deleted_at?: string | null }

const api = useApi()
const store = useTasksStore()
const rows = ref<DeletedTask[]>([])
const loading = ref(false)
const confirmOpen = ref(false)
const restoreId = ref<number | null>(null)
const restoring = ref(false)

function getCount(obj: any, snakeKey: string, camelKey: string) {
  return (obj?.[snakeKey] ?? obj?.[camelKey] ?? 0) as number
}

async function fetchDeleted() {
  loading.value = true
  try {
    const { data } = await api.get<DeletedTask[]>('/tasks/deleted')
    rows.value = data
  } finally {
    loading.value = false
  }
}

function openConfirm(id: number) {
  restoreId.value = id
  confirmOpen.value = true
}

async function doRestore() {
  if (restoreId.value == null) return
  restoring.value = true
  try {
    await store.restore(restoreId.value)
    rows.value = rows.value.filter(t => t.id !== restoreId.value)
    confirmOpen.value = false
    restoreId.value = null
  } catch (err) {
    console.error(err)
    alert('No se pudo restaurar la tarea.')
  } finally {
    restoring.value = false
  }
}

onMounted(fetchDeleted)
</script>

<template>
  <main class="container mx-auto px-4 py-6">
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="inline-flex items-center text-sm hover:underline">
            <ArrowLeft class="h-4 w-4 mr-1" /> Back to board
          </NuxtLink>
          <h1 class="text-lg font-semibold">Deleted Tasks</h1>
          <span class="text-xs bg-muted px-2 py-0.5 rounded-full border">
            {{ rows.length }}
          </span>
        </div>
        <div class="text-sm text-muted-foreground pr-1">
          Soft deleted — you can restore tasks.
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 class="h-5 w-5 mr-2 animate-spin" /> Loading…
      </div>

      <div v-else-if="rows.length === 0" class="text-sm text-muted-foreground py-16 text-center">
        No deleted tasks.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="t in rows" :key="t.id" class="hover:shadow-sm transition-shadow">
          <CardHeader class="pb-2">
            <CardTitle class="text-base leading-tight pr-8">
              {{ t.title }}
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <Badge v-for="c in t.categories" :key="c.id" variant="secondary" class="border"
                :style="{ backgroundColor: (c.color || '#999') + '22', borderColor: c.color || '#999' }">
                {{ c.name }}
              </Badge>
            </div>

            <div class="flex items-center justify-between text-muted-foreground">
              <div class="flex items-center gap-4">
                <span class="inline-flex items-center gap-1 text-xs">
                  <MessageSquare class="h-4 w-4" /> {{ getCount(t, 'comments_count', 'commentsCount') }}
                </span>
                <span class="inline-flex items-center gap-1 text-xs">
                  <Paperclip class="h-4 w-4" /> {{ getCount(t, 'attachments_count', 'attachmentsCount') }}
                </span>
              </div>
              <div class="flex -space-x-2">
                <img v-for="u in (t.assignees || []).slice(0, 3)" :key="u.id"
                  :src="u.avatar_url || ('https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(u.full_name || 'U'))"
                  :alt="u.full_name || 'User'" class="h-6 w-6 rounded-full ring-2 ring-white object-cover" />
              </div>
            </div>
          </CardContent>

          <CardFooter class="flex justify-between">
            <span class="text-xs text-muted-foreground">
              Deleted {{ t.deleted_at ? new Date(t.deleted_at).toLocaleString() : '' }}
            </span>
            <Button size="sm" class="gap-2" @click="openConfirm(t.id)">
              <Undo2 class="h-4 w-4" /> Restore
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <AlertDialog v-model:open="confirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore task</AlertDialogTitle>
          <AlertDialogDescription>
            This will move the task back to the board.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="restoring">Cancel</AlertDialogCancel>
          <AlertDialogAction :disabled="restoring" @click="doRestore">
            <span v-if="restoring" class="inline-flex items-center">
              <Loader2 class="h-4 w-4 mr-2 animate-spin" /> Restoring…
            </span>
            <span v-else>Restore</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </main>
</template>
