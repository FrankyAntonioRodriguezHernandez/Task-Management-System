import { defineStore } from 'pinia'
import type { Task, TaskCounts, TaskStatus } from '@/types'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    items: [] as Task[],
    counts: { in_progress: 0, reviews: 0, completed: 0, done: 0 } as TaskCounts,
    loading: false
  }),
  getters: {
    byStatus: (s) => (st: TaskStatus) => s.items.filter(t => t.status === st)
  },
  actions: {
    async fetchAll() {
      this.loading = true
      const api = useApi()
      const [tasks, counts] = await Promise.all([
        api.get<Task[]>('/tasks'),
        api.get<TaskCounts>('/tasks/counts')
      ])
      this.items = tasks.data
      this.counts = counts.data
      this.loading = false
    },
    async create(payload: { title: string; status: TaskStatus; category_ids: number[]; assignee_ids: number[] }) {
      const api = useApi()
      const { data } = await api.post<Task>('/tasks', payload)
      this.items.push(data)
      await this.refreshCounts()
      return data
    },
    async update(id: number, payload: Partial<Pick<Task, 'title' | 'status'>> & { category_ids?: number[]; assignee_ids?: number[] }) {
      const api = useApi()
      const { data } = await api.patch<Task>(`/tasks/${id}`, payload)
      this.items = this.items.map(t => (t.id === id ? data : t))
      await this.refreshCounts()
      return data
    },
    async softDelete(id: number) {
      const api = useApi()
      await api.delete(`/tasks/${id}`)
      this.items = this.items.filter(t => t.id !== id)
      await this.refreshCounts()
    },
    async refreshCounts() {
      const api = useApi()
      const { data } = await api.get<TaskCounts>('/tasks/counts')
      this.counts = data
    }
  }
})
