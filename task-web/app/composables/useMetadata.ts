import type { User, TaskCategory } from '../types'

export function useMetadata() {
  const users = useState<User[]>('meta:users', () => [])
  const categories = useState<TaskCategory[]>('meta:categories', () => [])
  const config = useRuntimeConfig()

  const load = async () => {
    const [u, c] = await Promise.all([
      $fetch<User[]>(`${config.public.apiBase}/users`),
      $fetch<TaskCategory[]>(`${config.public.apiBase}/categories`),
    ])
    users.value = u
    categories.value = c
  }

  if (!users.value.length || !categories.value.length) {
    load()
  }

  return { users, categories, refresh: load }
}
