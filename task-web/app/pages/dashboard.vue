<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useTasksStore } from '../stores/tasks'
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const store = useTasksStore()
onMounted(() => store.refreshCounts())
const chartData = computed(() => ({
  labels: ['In Progress','Reviews','Completed','Done'],
  datasets: [{ label: 'Tasks', data: [
    store.counts.in_progress,
    store.counts.reviews,
    store.counts.completed,
    store.counts.done
  ]}]
}))
</script>

<template>
  <div class="container mx-auto p-4 grid gap-4 md:grid-cols-4">
    <Card v-for="m in [
      { t:'Active Tasks', v: store.counts.in_progress + store.counts.reviews + store.counts.completed + store.counts.done },
      { t:'Completed (All)', v: store.counts.completed },
      { t:'In Review', v: store.counts.reviews },
      { t:'Done', v: store.counts.done },
    ]" :key="m.t">
      <CardHeader><CardTitle>{{ m.t }}</CardTitle></CardHeader>
      <CardContent><div class="text-3xl font-semibold">{{ m.v }}</div></CardContent>
    </Card>

    <Card class="md:col-span-4">
      <CardHeader><CardTitle>Tasks by status</CardTitle></CardHeader>
      <CardContent><Bar :data="chartData" :options="{ responsive: true, maintainAspectRatio: false }" style="height:320px" /></CardContent>
    </Card>
  </div>
</template>
