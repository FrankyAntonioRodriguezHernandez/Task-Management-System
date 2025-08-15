<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TaskColumn from '../components/TaskColumn.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import type { Task } from '../types'
import { Button } from '../components/ui/button'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'
import { ChevronDown, Sun, Moon } from 'lucide-vue-next'

type UserLite = {
  id: number
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
}

const store = useTasksStore()
const { users } = useMetadata()

function toArray<T = unknown>(input: unknown): T[] {
  if (input && typeof input === 'object' && 'value' in (input as any)) {
    const v = (input as any).value
    return Array.isArray(v) ? (v as T[]) : []
  }
  if (Array.isArray(input)) return input as T[]
  return []
}

const AVATAR_POOL = [
  '/avatars/1.png', '/avatars/2.png', '/avatars/3.png', '/avatars/4.png', '/avatars/5.png']

function withAvatar(u: UserLite, i: number): Required<UserLite> {
  const url = u.avatar_url || AVATAR_POOL[i % AVATAR_POOL.length] || null
  return {
    id: Number(u.id),
    full_name: u.full_name ?? null,
    email: u.email ?? null,
    avatar_url: url,
  }
}

const loading = ref(true)
const loadError = ref<string | null>(null)

async function ensureTasksLoaded() {
  loading.value = true
  loadError.value = null
  try {
    if (typeof (store as any).fetch === 'function') {
      await (store as any).fetch()
    } else if (typeof (store as any).fetchAll === 'function') {
      await (store as any).fetchAll()
    } else if (typeof (store as any).list === 'function') {
      await (store as any).list()
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}
onMounted(() => { void ensureTasksLoaded() })

const teamAvatars = ref<Required<UserLite>[]>([])

watch(
  () => toArray<UserLite>(users),
  (arr) => {
    if (!arr || arr.length === 0) return
    teamAvatars.value = arr.slice(0, 8).map((u, i) => withAvatar(u, i))
  },
  { immediate: true, deep: false }
)

teamAvatars.value = AVATAR_POOL.map((src, i) => ({
  id: i + 1,
  full_name: null,
  email: null,
  avatar_url: src,
}))


const items = computed<Task[]>(() => toArray<Task>((store as any).items))
const inProgress = computed(() => items.value.filter(t => t.status === 'in_progress'))
const reviews = computed(() => items.value.filter(t => t.status === 'reviews'))
const completed = computed(() => items.value.filter(t => t.status === 'completed'))
const done = computed(() => items.value.filter(t => t.status === 'done'))

const openEdit = ref(false)
const selected = ref<Task | null>(null)
function handleEdit(task: Task | null) { selected.value = task; openEdit.value = true }
function handleCreate() { handleEdit(null) }

const isDark = ref(false)
function toggleDark() {
  isDark.value = !isDark.value
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
onMounted(() => {
  const theme = localStorage.getItem('theme')
  if (theme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-4 py-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold dark:text-white">Tasks List</h1>

      <div class="flex items-center gap-3">
        <div class="hidden md:flex -space-x-2">
          <template v-for="u in teamAvatars" :key="u.id">
            <img :src="u.avatar_url!" :alt="u.full_name || u.email || ('User #' + u.id)"
              class="h-8 w-8 rounded-full ring-2 ring-background object-cover" />
          </template>
        </div>

        <Button variant="outline" size="icon" @click="toggleDark">
          <Sun v-if="!isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="gap-2">
              Views
              <ChevronDown class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem as-child>
              <NuxtLink to="/">Tasks List</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/dashboard">Dashboard</NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NuxtLink to="/deleted">Deleted</NuxtLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button class="bg-emerald-600 hover:bg-emerald-700 text-white" @click="handleCreate">
          + Add New
        </Button>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TaskColumn title="In Progress" color="bg-purple-500" :tasks="inProgress" @edit="handleEdit" />
      <TaskColumn title="Reviews" color="bg-orange-500" :tasks="reviews" @edit="handleEdit" />
      <TaskColumn title="Completed" color="bg-green-500" :tasks="completed" @edit="handleEdit" />
      <TaskColumn title="Done" color="bg-blue-500" :tasks="done" @edit="handleEdit" />
    </div>

    <TaskFormDialog v-model:open="openEdit" v-model:task="selected" />
  </div>
</template>
