<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { Task, TaskStatus } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from './ui/select'
import { toast } from 'vue-sonner'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'

const open = defineModel<boolean>('open', { default: false })
const editTask = defineModel<Task | null>('task', { default: null })

const isEdit = computed(() => !!editTask.value)

const schema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Title required'),
    status: z.enum(['in_progress', 'reviews', 'completed', 'done'] as const),
    category_ids: z.array(z.coerce.number()).default([]),
    assignee_ids: z.array(z.coerce.number()).default([]),
  })
)

const { handleSubmit, defineField, setValues, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { title: '', status: 'in_progress', category_ids: [], assignee_ids: [] }
})

const [title] = defineField<'title'>('title')
const [status] = defineField<'status'>('status')
const [category_ids] = defineField<'category_ids'>('category_ids')
const [assignee_ids] = defineField<'assignee_ids'>('assignee_ids')

const { users, categories } = useMetadata()
const store = useTasksStore()
type UiUser = { id: number; full_name?: string; name?: string; avatar_url?: string | null }
type UiCategory = { id: number; name: string }

const displayUsers = computed<UiUser[]>(() => {
  const metaUsers = (users?.value ?? users ?? []) as UiUser[]
  if (metaUsers && metaUsers.length) return metaUsers

// fallback: recolectar de las tareas existentes
  const map = new Map<number, UiUser>()
  for (const t of store.items as any[]) {
    for (const a of (t?.assignees ?? [])) {
      map.set(Number(a.id), {
        id: Number(a.id),
        full_name: a.full_name ?? a.name,
        avatar_url: a.avatar_url ?? null
      })
    }
  }
  return Array.from(map.values())
})

const displayCategories = computed<UiCategory[]>(() => {
  const metaCats = (categories?.value ?? categories ?? []) as UiCategory[]
  if (metaCats && metaCats.length) return metaCats

  // fallback: recolectar de tareas
  const map = new Map<number, UiCategory>()
  for (const t of store.items as any[]) {
    for (const c of (t?.categories ?? [])) {
      map.set(Number(c.id), { id: Number(c.id), name: c.name })
    }
  }
  return Array.from(map.values())
})

// Right column state
const commentText = ref('')
const file = ref<File | null>(null)
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

// Fill values on open edit, clear on close
watch(open, (v) => {
  if (v && editTask.value) {
    setValues({
      title: editTask.value.title,
      status: editTask.value.status as TaskStatus,
      category_ids: (editTask.value as any).categories?.map((c: any) => c.id) ?? [],
      assignee_ids: (editTask.value as any).assignees?.map((a: any) => a.id) ?? [],
    })
  }
  if (!v) {
    resetForm()
    commentText.value = ''
    file.value = null
  }
})

const onSubmit = handleSubmit(async (p) => {
  const payload = {
    title: p.title,
    status: p.status,
    category_ids: (p.category_ids || []).map(Number),
    assignee_ids: (p.assignee_ids || []).map(Number),
  }

  try {
    if (isEdit.value && editTask.value) {
      await store.update(editTask.value.id, payload)
      toast.success('Task updated')
    } else {
      await store.create(payload)
      toast.success('Task created')
    }
    open.value = false
  } catch (e: any) {
    toast.error(e?.message || 'Error')
  }
})

// Right column actions
async function submitComment() {
  if (!isEdit.value || !editTask.value) {
    return toast.error('Open an existing task to add a comment')
  }
  const body = commentText.value.trim()
  if (!body) return toast.error('Comment is empty')
  try {
    await store.addComment(editTask.value.id, body)
    toast.success('Comment added')
    commentText.value = ''
  } catch (e:any) {
    toast.error('Could not add comment')
  }
}

async function submitAttachment() {
  if (!isEdit.value || !editTask.value) {
    return toast.error('Open an existing task to add an attachment')
  }
  if (!file.value) return toast.error('Select a file')
  try {
    await store.uploadAttachment(editTask.value.id, file.value)
    toast.success('Attachment uploaded')
    file.value = null
  } catch (e:any) {
    toast.error('Could not upload attachment')
  }
}

async function softDelete() {
  if (!isEdit.value || !editTask.value) return
  try {
    await store.remove(editTask.value.id) // soft delete from your store
    toast.success('Task deleted')
    open.value = false
  } catch (e:any) {
    toast.error('Could not delete task')
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit Task' : 'Create Task' }}</DialogTitle>
        <DialogDescription class="sr-only">
          Fill the form to {{ isEdit ? 'update' : 'create' }} a task
        </DialogDescription>
      </DialogHeader>

      <!-- Two columns (compact & centered) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- LEFT: original form -->
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="text-sm mb-1 block">Title</label>
            <Input v-model="title" placeholder="Task title" />
          </div>

          <div>
            <label class="text-sm mb-1 block">Status</label>
            <Select v-model="status">
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
                <input type="checkbox" :value="c.id" v-model="category_ids" />
                <span>{{ c.name }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="text-sm mb-1 block">Assignees</label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="u in users" :key="u.id" class="flex items-center gap-2">
                <input type="checkbox" :value="u.id" v-model="assignee_ids" />
                <span>{{ u.full_name }}</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" class="w-full">
              {{ isEdit ? 'Save changes' : 'Create' }}
            </Button>
          </DialogFooter>
        </form>

        <!-- RIGHT: comment / attachment / delete (only useful in edit) -->
        <div class="space-y-6 text-center">
          <!-- Add Comment -->
          <div class="space-y-2">
            <div class="text-sm font-medium">Add Comment</div>
            <textarea
              v-model="commentText"
              rows="4"
              class="w-full rounded-md border p-2 text-sm"
              placeholder="Write your comment..."
            ></textarea>
            <Button variant="outline" class="w-full" @click="submitComment">
              Send Comment
            </Button>
          </div>

          <!-- Add Attachment -->
          <div class="space-y-2">
            <div class="text-sm font-medium">Add Attachment</div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              @change="onFileChange"
              class="text-sm w-full"
            />
            <Button :disabled="!file" variant="outline" class="w-full" @click="submitAttachment">
              Upload
            </Button>
          </div>

          <!-- Delete (soft) -->
          <div class="space-y-2">
            <div class="text-sm font-medium text-red-600">Delete Task</div>
            <Button class="w-full bg-red-600 hover:bg-red-700" @click="softDelete">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
