import { ref } from 'vue'
import type { User, TaskCategory } from '../types'
import { useApi } from '../services/api'

const _users = ref<User[] | null>(null)
const _categories = ref<TaskCategory[] | null>(null)
const _loading = ref(false)
const _loaded = ref(false)

export function useMetadata() {
  const api = useApi()

  async function loadOnce() {
    if (_loaded.value) return
    _loading.value = true
    try {
      const [u, c] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<TaskCategory[]>('/categories'),
      ])
      _users.value = u.data
      _categories.value = c.data
      _loaded.value = true
    } finally {
      _loading.value = false
    }
  }

  return {
    users: _users,
    categories: _categories,
    loading: _loading,
    loadOnce,
  }
}
