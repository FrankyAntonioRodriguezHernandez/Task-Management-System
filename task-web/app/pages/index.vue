<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TaskColumn from '../components/TaskColumn.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import type { Task } from '../types'
import { Button } from '../components/ui/button'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'
import { ChevronDown, Sun, Moon } from 'lucide-vue-next'

/* ---------- Types ---------- */
type UserLite = {
  id: number
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
}

/* ---------- Store & metadata ---------- */
const store = useTasksStore()
const { users } = useMetadata()

/* ---------- Helpers ---------- */
function toArray<T = unknown>(input: unknown): T[] {
  if (input && typeof input === 'object' && 'value' in (input as any)) {
    const v = (input as any).value
    return Array.isArray(v) ? (v as T[]) : []
  }
  if (Array.isArray(input)) return input as T[]
  return []
}

/** Pool de imágenes locales (coloca archivos en /public/avatars/) */
const AVATAR_POOL = [
  '/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg', '/avatars/4.jpg',
  '/avatars/5.jpg', '/avatars/6.jpg', '/avatars/7.jpg', '/avatars/8.jpg',
]

/** Asegura avatar_url siempre: si falta, asigna uno del pool */
function withAvatar(u: UserLite, i: number): Required<UserLite> {
  const url = u.avatar_url || AVATAR_POOL[i % AVATAR_POOL.length] || null
  return {
    id: Number(u.id),
    full_name: u.full_name ?? null,
    email: u.email ?? null,
    avatar_url: url,
  }
}

/* ---------- Carga de tareas ---------- */
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

/* ---------- Header: team avatars ---------- */
const teamAvatars = computed(() => {
  const arr = toArray<UserLite>(users)
  return arr.slice(0, 8).map((u, i) => withAvatar(u, i))
})

/* ---------- Lists by status ---------- */
const items = computed<Task[]>(() => toArray<Task>((store as any).items))
const inProgress = computed(() => items.value.filter(t => t.status === 'in_progress'))
const reviews     = computed(() => items.value.filter(t => t.status === 'reviews'))
const completed   = computed(() => items.value.filter(t => t.status === 'completed'))
const done        = computed(() => items.value.filter(t => t.status === 'done'))

/* ---------- Modal wiring ---------- */
const openEdit = ref(false)
const selected = ref<Task | null>(null)
function handleEdit(task: Task | null) { selected.value = task; openEdit.value = true }
function handleCreate() { handleEdit(null) }

/* ---------- Dark mode toggle ---------- */
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
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold dark:text-white">Tasks List</h1>

      <div class="flex items-center gap-3">
        <!-- Team avatars -->
        <div class="hidden md:flex -space-x-2">
          <template v-for="u in teamAvatars" :key="u.id">
            <img
              :src="u.avatar_url!"
              :alt="u.full_name || u.email || ('User #' + u.id)"
              class="h-8 w-8 rounded-full ring-2 ring-background object-cover"
            />
          </template>
        </div>

        <!-- Dark mode toggle -->
        <Button variant="outline" size="icon" @click="toggleDark">
          <Sun v-if="!isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>

        <!-- Sort y Filter (dejamos estos) -->
        <Button variant="outline" class="gap-2">
          Sort by <ChevronDown class="h-4 w-4" />
        </Button>
        <Button variant="outline" class="gap-2">
          Filter <ChevronDown class="h-4 w-4" />
        </Button>

        <!-- Add New -->
        <Button class="bg-emerald-600 hover:bg-emerald-700 text-white" @click="handleCreate">
          + Add New
        </Button>
      </div>
    </div>

    <!-- Board -->
    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TaskColumn title="In Progress" color="bg-purple-500" :tasks="inProgress" @edit="handleEdit"/>
      <TaskColumn title="Reviews" color="bg-orange-500" :tasks="reviews" @edit="handleEdit"/>
      <TaskColumn title="Completed" color="bg-green-500" :tasks="completed" @edit="handleEdit"/>
      <TaskColumn title="Done" color="bg-blue-500" :tasks="done" @edit="handleEdit"/>
    </div>

    <!-- Create/Edit dialog -->
    <TaskFormDialog v-model:open="openEdit" v-model:task="selected" />
  </div>
</template>
