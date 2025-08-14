<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import BoardColumn from '../components/BoardColumn.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import { useTasksStore } from '../stores/tasks'

const store = useTasksStore()
const openForm = ref(false)

onMounted(() => store.fetchAll())
</script>

<template>
  <div class="container mx-auto p-4 space-y-6">
    <AppHeader @create="openForm = true" />

    <div class="flex gap-4 overflow-x-auto pb-4">
      <BoardColumn
        title="In Progress"
        colorDot="#8b5cf6"
        :tasks="store.byStatus('in_progress')"
        :count="store.counts.in_progress" />
      <BoardColumn
        title="Reviews"
        colorDot="#f59e0b"
        :tasks="store.byStatus('reviews')"
        :count="store.counts.reviews" />
      <BoardColumn
        title="Completed"
        colorDot="#10b981"
        :tasks="store.byStatus('completed')"
        :count="store.counts.completed" />
      <BoardColumn
        title="Done"
        colorDot="#3b82f6"
        :tasks="store.byStatus('done')"
        :count="store.counts.done" />
    </div>

    <TaskFormDialog v-model:open="openForm" />
  </div>
</template>
