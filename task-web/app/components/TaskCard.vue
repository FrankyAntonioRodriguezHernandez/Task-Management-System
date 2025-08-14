<script setup lang="ts">
import type { Task } from '@/types'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { MessageCircle, Paperclip } from 'lucide-vue-next'

defineProps<{ task: Task }>()
</script>

<template>
  <Card class="hover:shadow-sm transition">
    <CardContent class="p-4 space-y-3">
      <h3 class="font-medium">{{ task.title }}</h3>

      <div class="flex flex-wrap gap-2">
        <Badge v-for="c in task.categories" :key="c.id"
               class="border"
               :style="{ borderColor: c.color + '33', color: c.color }">
          {{ c.name }}
        </Badge>
      </div>

      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <div class="flex items-center gap-4">
          <span>#{{ task.id }}</span>
          <span class="inline-flex items-center gap-1">
            <MessageCircle class="h-4 w-4" /> {{ task.comments_count }}
          </span>
          <span class="inline-flex items-center gap-1">
            <Paperclip class="h-4 w-4" /> {{ task.attachments_count }}
          </span>
        </div>
        <div class="flex -space-x-2">
          <img v-for="u in task.assignees.slice(0,3)" :key="u.id"
               :src="u.avatar_url || `https://i.pravatar.cc/24?u=${u.id}`"
               class="h-6 w-6 rounded-full ring-2 ring-background" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
