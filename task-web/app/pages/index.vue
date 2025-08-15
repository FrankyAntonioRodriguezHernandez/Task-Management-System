<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TaskColumn from '../components/TaskColumn.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import type { Task } from '../types'
import { Button } from '../components/ui/button'
import { useTasksStore } from '../stores/tasks'
import { useMetadata } from '../composables/useMetadata'
import { MoreHorizontal, ChevronDown, Sun, Moon } from 'lucide-vue-next'

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

/* ---------- Helper: normalizar a array ---------- */
function toArray<T = unknown>(input: unknown): T[] {
  if (input && typeof input === 'object' && 'value' in (input as any)) {
    const v = (input as any).value
    return Array.isArray(v) ? (v as T[]) : []
  }
  if (Array.isArray(input)) return input as T[]
  return []
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
const teamAvatars = computed<UserLite[]>(() => toArray<UserLite>(users))

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
          <template v-for="u in teamAvatars.slice(0,5)" :key="u.id">
            <img
              v-if="u.avatar_url"
              :src="u.avatar_url!"
              :alt="u.full_name || u.email || ('User #' + u.id)"
              class="h-8 w-8 rounded-full ring-2 ring-background object-cover"
            />
            <div
              v-else
              class="h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] uppercase dark:bg-gray-700 dark:text-gray-200"
            >
              {{ (u.full_name || u.email || 'U' + u.id)?.slice(0,2) }}
            </div>
          </template>
        </div>

        <!-- Dark mode toggle -->
        <Button variant="outline" size="icon" @click="toggleDark">
          <Sun v-if="!isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>

        <Button variant="outline" class="gap-2">
          Import/Export <ChevronDown class="h-4 w-4" />
        </Button>

        <Button class="bg-emerald-600 hover:bg-emerald-700 text-white" @click="handleCreate">
          + Add New
        </Button>
      </div>
    </div>

    <!-- Controls -->
    <div class="mt-6 flex flex-wrap items-center gap-2">
      <Button variant="outline" class="gap-2">List View</Button>
      <Button variant="outline" class="gap-2">Sort by</Button>
      <Button variant="outline" class="gap-2">Filter</Button>
      <div class="ml-auto">
        <Button variant="ghost" size="icon">
          <MoreHorizontal class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="mt-10 text-sm text-muted-foreground dark:text-gray-400">Loading tasks…</div>
    <div v-else-if="loadError" class="mt-10 text-sm text-red-600">{{ loadError }}</div>

    <!-- Board -->
    <div v-else class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TaskColumn title="In Progress" color="bg-purple-500" :tasks="inProgress" @edit="handleEdit"/>
      <TaskColumn title="Reviews" color="bg-orange-500" :tasks="reviews" @edit="handleEdit"/>
      <TaskColumn title="Completed" color="bg-green-500" :tasks="completed" @edit="handleEdit"/>
      <TaskColumn title="Done" color="bg-blue-500" :tasks="done" @edit="handleEdit"/>
    </div>

    <!-- Create/Edit dialog -->
    <TaskFormDialog v-model:open="openEdit" v-model:task="selected" />
  </div>
</template>
