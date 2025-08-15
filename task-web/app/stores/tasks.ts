import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Task,
  TaskCounts,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
} from '../types'
import { useApi } from '../services/api'

export const useTasksStore = defineStore('tasks', () => {
  const api = useApi()

  const items = ref<Task[]>([])
  const deleted = ref<Task[]>([])
  const counts = ref<TaskCounts>({
    in_progress: 0,
    reviews: 0,
    completed: 0,
    done: 0,
  })
  const loading = ref(false)

  function upsertItem(next: Task) {
    const i = items.value.findIndex((t) => t.id === next.id)
    if (i > -1) {
      items.value[i] = next
    } else {
      items.value.push(next)
    }
  }

  async function fetchAll() {
    loading.value = true
    try {
      const [t, c] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<TaskCounts>('/tasks/counts'),
      ])
      items.value = t.data
      counts.value = c.data
    } finally {
      loading.value = false
    }
  }

  async function fetchDeleted() {
    const { data } = await api.get<Task[]>('/tasks/deleted')
    deleted.value = data
    return data
  }

  async function create(payload: CreateTaskDto) {
    const normalized: CreateTaskDto = {
      ...payload,
      category_ids: (payload.category_ids || []).map(Number),
      assignee_ids: (payload.assignee_ids || []).map(Number),
    }
    const { data } = await api.post<Task>('/tasks', normalized)
    if (!data?.categories || !data?.assignees) {
      await fetchAll()
      return data
    }
    upsertItem(data)
    await refreshCounts()
    return data
  }

  async function update(id: number, payload: UpdateTaskDto) {
    const normalized: UpdateTaskDto = {
      ...payload,
      category_ids: payload.category_ids?.map(Number) ?? undefined,
      assignee_ids: payload.assignee_ids?.map(Number) ?? undefined,
    }

    const { data } =
      (await api.put<Task>(`/tasks/${id}`, normalized).catch(async () => {
        const r = await api.patch<Task>(`/tasks/${id}`, normalized)
        return r
      }))

    if (!data?.categories || !data?.assignees) {
      await fetchAll()
      return data
    }

    upsertItem(data)
    await refreshCounts()
    return data
  }

  async function remove(id: number) {
    await api.delete(`/tasks/${id}`)
    items.value = items.value.filter((t) => t.id !== id)
    try { await fetchDeleted() } catch { }
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

  async function addComment(taskId: number, comment: string) {
    await api.post(`/tasks/${taskId}/comments`, { comment })
    await fetchAll()
  }

  async function uploadAttachment(taskId: number, file: File) {
    const form = new FormData()
    form.append('file', file)
    await api.post(`/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await fetchAll()
  }
  async function fetchComments(taskId: number) {
    const { data } = await api.get(`/tasks/${taskId}/comments`)
    return data
  }

  async function fetchAttachments(taskId: number) {
    const { data } = await api.get(`/tasks/${taskId}/attachments`)
    return data
  }


  const byStatus = (s: TaskStatus) =>
    computed(() => items.value.filter((t) => t.status === s))

  return {
    items,
    deleted,
    counts,
    loading,
    fetchAll,
    fetchDeleted,
    create,
    update,
    remove,
    restore,
    refreshCounts,
    addComment,
    uploadAttachment,
    byStatus,
    fetchComments,
    fetchAttachments,
  }
})