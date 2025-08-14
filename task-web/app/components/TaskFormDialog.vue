<script setup lang="ts">
import { computed, watch } from 'vue'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { Task, TaskStatus } from '../types'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from './ui/select'

import { toast } from 'vue-sonner'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'

const open = defineModel<boolean>('open', { default: false })
const editTask = defineModel<Task | null>('task', { default: null })

const { users, categories } = useMetadata()

const isEdit = computed(() => !!editTask.value)

const schema = toTypedSchema(z.object({
  title: z.string().min(1, 'Title required'),
  status: z.enum(['in_progress', 'reviews', 'completed', 'done'] as const),
  category_ids: z.array(z.number()).default([]),
  assignee_ids: z.array(z.number()).default([]),
}))

const { handleSubmit, values, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    status: 'in_progress' as TaskStatus,
    category_ids: [],
    assignee_ids: [],
  },
})

watch(open, (v) => {
  if (v && editTask.value) {
    setValues({
      title: editTask.value.title,
      status: editTask.value.status,
      category_ids: editTask.value.categories?.map(c => c.id) ?? [],
      assignee_ids: editTask.value.assignees?.map(a => a.id) ?? [],
    })
  } else if (v) {
    setValues({ title: '', status: 'in_progress', category_ids: [], assignee_ids: [] })
  }
})

const store = useTasksStore()
const onSubmit = handleSubmit(async (payload) => {
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
    toast.error(e?.message ?? 'Error')
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit Task' : 'Create Task' }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
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

        <DialogFooter>
          <Button type="submit" class="w-full">{{ isEdit ? 'Save changes' : 'Create' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
