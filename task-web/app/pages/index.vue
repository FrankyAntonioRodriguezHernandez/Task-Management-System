<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'
import TaskSheet from '../components/TaskSheet.vue'

const store = useTasksStore()
const sheetOpen = ref(false)
const editing = ref(null as any)
const activeTab = ref<'details'|'comments'|'attachments'>('details')

function openCreate() {
  editing.value = null
  activeTab.value = 'details'
  sheetOpen.value = true
}
function openTask(payload: { task:any; tab?: 'details'|'comments'|'attachments' }) {
  editing.value = payload.task
  activeTab.value = payload.tab || 'details'
  sheetOpen.value = true
}

onMounted(() => store.fetchAll())
</script>

<template>
  <main class="container mx-auto px-4 py-6 grid gap-6 grid-cols-1 md:grid-cols-4">
    <section class="rounded-xl p-3 bg-violet-50/60">
      <header class="flex items-center gap-2 mb-3">
        <span class="h-2 w-2 rounded-full bg-violet-500"></span>
        <h2 class="font-semibold">In Progress</h2>
        <span class="ml-1 text-xs bg-white px-2 py-0.5 rounded-full border">
          {{ store.counts.in_progress }}
        </span>
      </header>
      <div class="space-y-3">
        <TaskCard
          v-for="t in store.byStatus('in_progress').value"
          :key="t.id"
          :task="t"
          @open="openTask"
        />
      </div>
    </section>

    <section class="rounded-xl p-3 bg-amber-50/60">
      <header class="flex items-center gap-2 mb-3">
        <span class="h-2 w-2 rounded-full bg-amber-500"></span>
        <h2 class="font-semibold">Reviews</h2>
        <span class="ml-1 text-xs bg-white px-2 py-0.5 rounded-full border">
          {{ store.counts.reviews }}
        </span>
      </header>
      <div class="space-y-3">
        <TaskCard
          v-for="t in store.byStatus('reviews').value"
          :key="t.id"
          :task="t"
          @open="openTask"
        />
      </div>
    </section>

    <section class="rounded-xl p-3 bg-emerald-50/60">
      <header class="flex items-center gap-2 mb-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <h2 class="font-semibold">Completed</h2>
        <span class="ml-1 text-xs bg-white px-2 py-0.5 rounded-full border">
          {{ store.counts.completed }}
        </span>
      </header>
      <div class="space-y-3">
        <TaskCard
          v-for="t in store.byStatus('completed').value"
          :key="t.id"
          :task="t"
          @open="openTask"
        />
      </div>
    </section>

    <section class="rounded-xl p-3 bg-sky-50/60">
      <header class="flex items-center gap-2 mb-3">
        <span class="h-2 w-2 rounded-full bg-sky-500"></span>
        <h2 class="font-semibold">Done</h2>
        <span class="ml-1 text-xs bg-white px-2 py-0.5 rounded-full border">
          {{ store.counts.done }}
        </span>
      </header>
      <div class="space-y-3">
        <TaskCard
          v-for="t in store.byStatus('done').value"
          :key="t.id"
          :task="t"
          @open="openTask"
        />
      </div>
    </section>
  </main>

  <TaskSheet v-model:open="sheetOpen" v-model:task="editing" v-model:tab="activeTab" />
</template>
