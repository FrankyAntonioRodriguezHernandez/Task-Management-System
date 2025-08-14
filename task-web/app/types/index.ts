export type TaskStatus = 'in_progress' | 'reviews' | 'completed' | 'done'

export interface User {
  id: number
  full_name: string
  avatar_url?: string | null
  email?: string
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
  created_by?: number
  categories: TaskCategory[]
  assignees: User[]
  comments_count?: number
  attachments_count?: number
}

export interface TaskCounts {
  in_progress: number
  reviews: number
  completed: number
  done: number
}

export interface CreateTaskDto {
  title: string
  status: TaskStatus
  category_ids: number[]
  assignee_ids: number[]
}

export type UpdateTaskDto = Partial<CreateTaskDto>