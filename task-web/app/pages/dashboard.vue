<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../stores/tasks'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useTasksStore()
if (!store.items.length) await store.fetchAll()

const metrics = computed(() => ({
  totalActive: store.items.length,
  inReviews: store.counts.reviews,
  completedThisMonth: store.counts.completed,
  avgCompletionDays: 3,
}))

const chartData = computed(() => ({
  labels: ['In Progress', 'Reviews', 'Completed', 'Done'],
  datasets: [
    {
      label: 'Tasks by status', data: [
        store.counts.in_progress,
        store.counts.reviews,
        store.counts.completed,
        store.counts.done,
      ]
    },
  ],
}))
const chartOptions = { responsive: true, maintainAspectRatio: false }
</script>

<template>
  <div class="grid gap-6 md:grid-cols-4">
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-sm text-muted-foreground">Total de Tareas Activas</div>
      <div class="text-2xl font-semibold">{{ metrics.totalActive }}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-sm text-muted-foreground">Tareas Completadas este Mes</div>
      <div class="text-2xl font-semibold">{{ metrics.completedThisMonth }}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-sm text-muted-foreground">Tareas en Revisión</div>
      <div class="text-2xl font-semibold">{{ metrics.inReviews }}</div>
    </div>
    <div class="rounded-xl border p-4 bg-card">
      <div class="text-sm text-muted-foreground">Promedio de Finalización (días)</div>
      <div class="text-2xl font-semibold">{{ metrics.avgCompletionDays }}</div>
    </div>
  </div>

  <div class="mt-6 rounded-xl border p-4 h-80 bg-card">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
