import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskCounts, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../types'
import { useApi } from '../services/api'

export const useTasksStore = defineStore('tasks', () => {
  const api = useApi()
  const items = ref<Task[]>([])
  const counts = ref<TaskCounts>({ in_progress: 0, reviews: 0, completed: 0, done: 0 })
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const [t, c] = await Promise.all([api.get<Task[]>('/tasks'), api.get<TaskCounts>('/tasks/counts')])
      items.value = t.data
      counts.value = c.data
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateTaskDto) {
  payload = {
    ...payload,
    category_ids: payload.category_ids.map(Number),
    assignee_ids: payload.assignee_ids.map(Number),
  }
  const { data } = await api.post<Task>('/tasks', payload)
  //forzamos sync
  await fetchAll()
  return data
}

async function update(id: number, payload: UpdateTaskDto) {
  payload = {
    ...payload,
    category_ids: payload.category_ids?.map(Number) ?? undefined,
    assignee_ids: payload.assignee_ids?.map(Number) ?? undefined,
  }
  const { data } = await api.put<Task>(`/tasks/${id}`, payload).catch(async () => {
    // fallback si sólo soporta PATCH
    const r = await api.patch<Task>(`/tasks/${id}`, payload)
    return r
  })
  const i = items.value.findIndex((t) => t.id === id)
  if (i > -1) items.value[i] = data
  await refreshCounts()
  return data
}

  async function remove(id: number) {
    await api.delete(`/tasks/${id}`)
    items.value = items.value.filter((t) => t.id !== id)
    await refreshCounts()
  }

  async function restore(id: number) {
    const { data } = await api.post<Task>(`/tasks/${id}/restore`)
    items.value.push(data)
    await refreshCounts()
    return data
  }

  async function refreshCounts() {
    const { data } = await api.get<TaskCounts>('/tasks/counts')
    counts.value = data
  }

  const byStatus = (s: TaskStatus) => computed(() => items.value.filter((t) => t.status === s))

  return { items, counts, loading, fetchAll, create, update, remove, restore, byStatus }
})
