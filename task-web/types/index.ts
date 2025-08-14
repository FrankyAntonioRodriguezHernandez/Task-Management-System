export type TaskStatus = 'in_progress' | 'reviews' | 'completed' | 'done'

export interface User {
  id: number
  full_name: string
  email?: string
  avatar_url?: string | null
}

export interface TaskCategory {
  id: number
  name: string
  color: string
}

export interface Task {
  id: number
  title: string
  status: TaskStatus
  created_by: number
  created_at?: string
  updated_at?: string
  categories?: TaskCategory[]
  assignees?: User[]
  commentsCount?: number
  attachmentsCount?: number
}

export type TaskCounts = Record<TaskStatus, number>
