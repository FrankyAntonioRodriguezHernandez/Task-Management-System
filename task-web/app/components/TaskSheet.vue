<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { Task, TaskStatus } from '../types'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from './ui/select'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog'
import { Separator } from './ui/separator'
import { MessageSquare, Paperclip, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open', { default: false })
const taskModel = defineModel<Task | null>('task', { default: null })

type Tab = 'details' | 'comments' | 'attachments'
const startTab = defineModel<Tab>('tab', { default: 'details' })

const tab = ref<Tab>('details')
watch(open, (v) => { if (v) tab.value = startTab.value })

const store = useTasksStore()
const { users, categories } = useMetadata()

const schema = toTypedSchema(z.object({
  title: z.string().min(1, 'Title required'),
  status: z.enum(['in_progress','reviews','completed','done'] as [TaskStatus, TaskStatus, TaskStatus, TaskStatus]),
  category_ids: z.array(z.number()).default([]),
  assignee_ids: z.array(z.number()).default([]),
}))

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
  initialValues: { title: '', status: 'in_progress', category_ids: [], assignee_ids: [] }
})

watch(open, (v) => {
  if (!v) return
  const t = taskModel.value
  if (t) {
    setValues({
      title: t.title,
      status: t.status,
      category_ids: t.categories.map(c => c.id),
      assignee_ids: t.assignees.map(a => a.id),
    })
  } else {
    setValues({ title: '', status: 'in_progress', category_ids: [], assignee_ids: [] })
  }
})

const isEdit = computed(() => !!taskModel.value)

const onSave = handleSubmit(async (payload) => {
  try {
    if (isEdit.value && taskModel.value) {
      await store.update(taskModel.value.id, payload)
      toast.success('Task updated')
    } else {
      const created = await store.create(payload)
      taskModel.value = created
      toast.success('Task created')
    }
  } catch (e:any) {
    toast.error(e?.message || 'Error')
  }
})

const comments = ref<Array<{ id:number, comment:string, user:{ id:number, full_name:string, avatar_url?:string|null }, created_at:string }>>([])
const commentText = ref('')

async function loadFull() {
  if (!taskModel.value) return
  const t = await store.getOne(taskModel.value.id)
  comments.value = (t as any).comments ?? []
  attachments.value = (t as any).attachments ?? []
}

watch([open, tab], async () => {
  if (open.value && (tab.value === 'comments' || tab.value === 'attachments')) {
    await loadFull()
  }
})

async function sendComment() {
  const text = commentText.value.trim()
  if (!text) return
  await store.addComment(taskModel!.value!.id, text)
  commentText.value = ''
  await loadFull()
}

const attachments = ref<Array<{ id:number, file_name:string, file_path:string, file_size:number, created_at:string }>>([])
const file = ref<File | null>(null)
const MAX_SIZE = 5 * 1024 * 1024
const ACCEPT = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg']

function onFileChange(e: Event) {
  const el = e.target as HTMLInputElement
  const f = el.files?.[0] ?? null
  if (!f) { file.value = null; return }
  if (f.size > MAX_SIZE) { toast.error('Max 5MB'); return }
  if (!ACCEPT.includes(f.type)) { toast.error('Tipo no permitido'); return }
  file.value = f
}
async function upload() {
  if (!file.value) return
  await store.uploadAttachment(taskModel!.value!.id, file.value)
  file.value = null
  await loadFull()
  toast.success('Attachment uploaded')
}

async function confirmDelete() {
  await store.remove(taskModel!.value!.id)
  open.value = false
  toast.success('Task deleted')
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-full sm:max-w-xl">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-2">
          <span>{{ isEdit ? 'Edit Task' : 'Create Task' }}</span>
        </SheetTitle>
      </SheetHeader>

      <!-- Tabs manuales -->
      <div class="mt-4 flex items-center gap-2">
        <button
          class="px-3 py-1 rounded-md text-sm"
          :class="tab==='details' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="tab='details'"
        >Details</button>
        <button
          class="px-3 py-1 rounded-md text-sm flex items-center gap-1"
          :class="tab==='comments' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="tab='comments'"
        ><MessageSquare class="h-4 w-4" /> Comments</button>
        <button
          class="px-3 py-1 rounded-md text-sm flex items-center gap-1"
          :class="tab==='attachments' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="tab='attachments'"
        ><Paperclip class="h-4 w-4" /> Attachments</button>

        <div class="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="destructive" size="sm" class="gap-2">
                <Trash2 class="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>It will be soft-deleted.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  @click="confirmDelete">Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator class="my-4" />

      <form v-if="tab==='details'" class="space-y-4" @submit.prevent="onSave">
        <div>
          <label class="text-sm mb-1 block">Title</label>
          <Input v-model="(values as any).title" placeholder="Task title" />
        </div>

        <div>
          <label class="text-sm mb-1 block">Status</label>
          <Select v-model="(values as any).status">
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="reviews">Reviews</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="text-sm mb-1 block">Categories</label>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="c in categories" :key="c.id" class="flex items-center gap-2">
              <input type="checkbox" :value="c.id" v-model="(values as any).category_ids" />
              <span>{{ c.name }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="text-sm mb-1 block">Assignees</label>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="u in users" :key="u.id" class="flex items-center gap-2">
              <input type="checkbox" :value="u.id" v-model="(values as any).assignee_ids" />
              <span>{{ u.full_name }}</span>
            </label>
          </div>
        </div>

        <SheetFooter class="mt-6">
          <Button type="submit" class="w-full">{{ isEdit ? 'Save changes' : 'Create' }}</Button>
        </SheetFooter>
      </form>

      <div v-else-if="tab==='comments'" class="space-y-4">
        <div v-if="!comments.length" class="text-sm text-muted-foreground">No comments yet.</div>
        <ul v-else class="space-y-3">
          <li v-for="c in comments" :key="c.id" class="flex gap-3">
            <img
              :src="c.user?.avatar_url || ('https://api.dicebear.com/9.x/initials/svg?seed='+encodeURIComponent(c.user?.full_name || 'U'))"
              class="h-8 w-8 rounded-full object-cover"
            />
            <div class="min-w-0">
              <div class="text-sm font-medium">{{ c.user?.full_name }}</div>
              <div class="text-xs text-muted-foreground">{{ new Date(c.created_at).toLocaleString() }}</div>
              <p class="text-sm mt-1 break-words">{{ c.comment }}</p>
            </div>
          </li>
        </ul>

        <div class="pt-2">
          <textarea
            v-model="commentText"
            rows="3"
            placeholder="Write a comment..."
            class="w-full rounded-md border p-2 text-sm"
          />
          <div class="mt-2 flex justify-end">
            <Button size="sm" @click="sendComment">Add comment</Button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center gap-2">
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" @change="onFileChange" class="text-sm" />
          <Button size="sm" :disabled="!file" @click="upload">Upload</Button>
        </div>

        <div v-if="!attachments.length" class="text-sm text-muted-foreground">No attachments yet.</div>
        <ul v-else class="space-y-2">
          <li v-for="a in attachments" :key="a.id" class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-medium truncate">{{ a.file_name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ (a.file_size/1024).toFixed(0) }} KB · {{ new Date(a.created_at).toLocaleString() }}
              </div>
            </div>
            <a :href="a.file_path" target="_blank" class="text-sm text-primary hover:underline">Download</a>
          </li>
        </ul>
      </div>
    </SheetContent>
  </Sheet>
</template>
