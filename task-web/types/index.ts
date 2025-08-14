export type TaskStatus = 'in_progress' | 'reviews' | 'completed' | 'done'

export interface User {
  id: number
  full_name: string
  avatar_url?: string | null
}

export interface TaskCategory {
  id: number
  name: string
  color: string // hex
}

export interface Task {
  id: number
  title: string
  status: TaskStatus
  categories: TaskCategory[]
  assignees: User[]
  comments_count: number
  attachments_count: number
}

export interface TaskCounts {
  in_progress: number
  reviews: number
  completed: number
  done: number
}
