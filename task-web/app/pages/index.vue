<script setup lang="ts">
import { ref } from 'vue'
import TaskColumn from '../components/TaskColumn.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import type { Task } from '../types'
import { useTasksStore } from '../stores/tasks'


const store = useTasksStore()
await store.fetchAll()

const openEdit = ref(false)
const selected = ref<Task | null>(null)

function handleEdit(task: Task) {
  selected.value = task
  openEdit.value = true
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4 rounded">
    <TaskColumn
      class="bg-gray-100 dark:bg-gray-900"
      title="In Progress"
      colorClass="bg-purple-500"
      :tasks="store.byStatus('in_progress').value"
      @edit="handleEdit"
    />
    <TaskColumn
      class="bg-gray-100 dark:bg-gray-900"
      title="Reviews"
      colorClass="bg-orange-500"
      :tasks="store.byStatus('reviews').value"
      @edit="handleEdit"
    />
    <TaskColumn
      class="bg-gray-100 dark:bg-gray-900"
      title="Completed"
      colorClass="bg-green-500"
      :tasks="store.byStatus('completed').value"
      @edit="handleEdit"
    />
    <TaskColumn
      class="bg-gray-100 dark:bg-gray-900"
      title="Done"
      colorClass="bg-blue-500"
      :tasks="store.byStatus('done').value"
      @edit="handleEdit"
    />
  </div>

  <!-- Modal editar -->
  <TaskFormDialog v-model:open="openEdit" v-model:task="selected" />
</template>
