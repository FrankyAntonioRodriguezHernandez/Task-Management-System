import { DateTime } from 'luxon'
import Task, { type TaskStatus } from '#models/task'
import TaskCategory from '#models/task_category'
import User from '#models/user'

type ListOptions = { status?: TaskStatus; trashed?: boolean }

function serializeTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    created_by: t.created_by,
    created_at: t.created_at?.toISO(),
    updated_at: t.updated_at?.toISO(),
    categories: t.categories?.map((c) => ({ id: c.id, name: c.name, color: c.color })) ?? [],
    assignees: t.assignees?.map((u) => ({ id: u.id, full_name: u.full_name, avatar_url: u.avatar_url })) ?? [],
    commentsCount: t.comments?.length ?? 0,
    attachmentsCount: t.attachments?.length ?? 0,
  }
}

export default class TaskService {
  async list(opts: ListOptions = {}) {
    const rows = await Task.query()
      .if(!opts.trashed, (q) => q.withScopes((s) => s.notTrashed()))
      .if(Boolean(opts.trashed), (q) => q.withScopes((s) => s.onlyTrashed()))
      .if(Boolean(opts.status), (q) => q.where('status', opts.status!))
      .preload('categories', (q) => q.select(['id', 'name', 'color']))
      .preload('assignees', (q) => q.select(['id', 'full_name', 'avatar_url']))
      .preload('comments', (q) => q.select(['id']))
      .preload('attachments', (q) => q.select(['id']))
      .orderBy('id', 'asc')
    return rows.map(serializeTask)
  }

  async counts() {
    const statuses: TaskStatus[] = ['in_progress', 'reviews', 'completed', 'done']
    const out: Record<TaskStatus, number> = { in_progress: 0, reviews: 0, completed: 0, done: 0 }
    for (const s of statuses) {
      const r = await Task.query().withScopes((sc) => sc.notTrashed()).where('status', s).count('* as total')
      out[s] = Number(r[0].$extras.total)
    }
    return out
  }

  async getOne(id: number, opts: { trashed?: boolean } = {}) {
    const t = await Task.query()
      .if(!opts.trashed, (qb) => qb.withScopes((s) => s.notTrashed()))
      .if(Boolean(opts.trashed), (qb) => qb.withScopes((s) => s.onlyTrashed()))
      .where('id', id)
      .preload('categories')
      .preload('assignees')
      .preload('comments')
      .preload('attachments')
      .firstOrFail()
    return serializeTask(t)
  }

  async create(
    data: { title: string; status: TaskStatus; categoryIds?: number[]; assigneeIds?: number[] },
    currentUserId: number
  ) {
    const task = await Task.create({ title: data.title, status: data.status, created_by: currentUserId })

    if (data.categoryIds?.length) {
      const ids = (await TaskCategory.query().whereIn('id', data.categoryIds)).map((c) => c.id)
      await task.related('categories').sync(ids)
    }

    if (data.assigneeIds?.length) {
      const ids = (await User.query().whereIn('id', data.assigneeIds)).map((u) => u.id)
      await task.related('assignees').sync(ids)
    }

    return this.getOne(task.id)
  }

  async update(
    id: number,
    data: { title?: string; status?: TaskStatus; categoryIds?: number[]; assigneeIds?: number[] }
  ) {
    const task = await Task.findOrFail(id)
    if (task.deleted_at) throw new Error('Cannot update a deleted task')

    if (data.title !== undefined) task.title = data.title
    if (data.status !== undefined) task.status = data.status
    await task.save()

    if (data.categoryIds) await task.related('categories').sync(data.categoryIds)
    if (data.assigneeIds) await task.related('assignees').sync(data.assigneeIds)

    return this.getOne(task.id)
  }

  async softDelete(id: number) {
    const task = await Task.query().withScopes((s) => s.notTrashed()).where('id', id).firstOrFail()
    task.deleted_at = DateTime.now()
    await task.save()
    return { id: task.id, deleted_at: task.deleted_at?.toISO() }
  }

  async restore(id: number) {
    const task = await Task.query().withScopes((s) => s.onlyTrashed()).where('id', id).firstOrFail()
    task.deleted_at = null
    await task.save()
    return this.getOne(task.id)
  }

  async listDeleted() {
    return this.list({ trashed: true })
  }
}
