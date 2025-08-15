<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '../types'
import { toast } from 'vue-sonner'
import { useTasksStore } from '../stores/tasks'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog'
import { MoreHorizontal, File, Pencil, Trash2, MessageCircleMore } from 'lucide-vue-next'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ (e:'edit', task: Task): void }>()

const store = useTasksStore()

/* avatares visibles (máx 3) */
const assignees = computed(() => (props.task.assignees ?? []).slice(0, 3))

const commentOpen = ref(false)
const attachOpen  = ref(false)
const commentText = ref('')
const file = ref<File|null>(null)

function onFileChange(e: Event) {
  const el = e.target as HTMLInputElement
  file.value = el.files?.[0] ?? null
}

async function submitComment() {
  if (!commentText.value.trim()) return
  await store.addComment(props.task.id, commentText.value)
  toast.success('Comment added')
  commentText.value = ''
  commentOpen.value = false
}

async function submitAttachment() {
  if (!file.value) return
  await store.uploadAttachment(props.task.id, file.value)
  toast.success('Attachment uploaded')
  file.value = null
  attachOpen.value = false
}
</script>

<template>
  <Card class="relative overflow-hidden">
    <div class="absolute right-2 top-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="h-8 w-8">
            <MoreHorizontal class="h-4 w-4" />
            <span class="sr-only">Open</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-44">
          <DropdownMenuItem @select="emit('edit', task)">
            <Pencil class="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem @select="commentOpen = true">
            <MessageCircleMore class="mr-2 h-4 w-4" /> Comment
          </DropdownMenuItem>
          <DropdownMenuItem @select="attachOpen = true">
            <File class="mr-2 h-4 w-4" /> Attachment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <DropdownMenuItem class="text-destructive focus:text-destructive">
                <Trash2 class="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>This will soft-delete the task.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  @click="store.remove(task.id)"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

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
        <div class="flex items-center gap-1">
          <File class="h-4 w-4" />
          <span class="text-xs">{{ task.attachments_count ?? 0 }}</span>
        </div>
        <div class="flex items-center gap-1">
          <MessageCircleMore class="h-4 w-4" />
          <span class="text-xs">{{ task.comments_count ?? 0 }}</span>
        </div>
      </div>

      <!-- avatares -->
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

  <Dialog v-model:open="commentOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader><DialogTitle>Add comment</DialogTitle></DialogHeader>
      <textarea rows="4" v-model="commentText" class="w-full rounded-md border p-2 text-sm" placeholder="Write a comment..." />
      <DialogFooter>
        <Button @click="submitComment">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="attachOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader><DialogTitle>Add attachment</DialogTitle></DialogHeader>
      <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" @change="onFileChange" class="text-sm" />
      <DialogFooter>
        <Button :disabled="!file" @click="submitAttachment">Upload</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
