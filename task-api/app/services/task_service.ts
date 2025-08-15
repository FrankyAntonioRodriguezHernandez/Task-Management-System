import { DateTime } from 'luxon'
import Task, { type TaskStatus } from '#models/task'

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
    // usa extras de withCount si existen; si no, cae al length de las relaciones
    comments_count: Number(t.$extras?.comments_count ?? t.comments?.length ?? 0),
    attachments_count: Number(t.$extras?.attachments_count ?? t.attachments?.length ?? 0),
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
      .withCount('comments')
      .withCount('attachments')
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
      .preload('categories', (q) => q.select(['id', 'name', 'color']))
      .preload('assignees', (q) => q.select(['id', 'full_name', 'avatar_url']))
      .withCount('comments')
      .withCount('attachments')
      .firstOrFail()
    return serializeTask(t)
  }

  async create(
    data: {
      title: string
      status: TaskStatus
      category_ids?: number[]
      assignee_ids?: number[]
      // tolera camelCase por si acaso
      categoryIds?: number[]
      assigneeIds?: number[]
    },
    currentUserId: number
  ) {
    const task = await Task.create({ title: data.title, status: data.status, created_by: currentUserId })

    const categoryIds = data.category_ids ?? data.categoryIds ?? []
    const assigneeIds = data.assignee_ids ?? data.assigneeIds ?? []

    if (categoryIds.length) {
      await task.related('categories').attach(categoryIds)
    }
    if (assigneeIds.length) {
      await task.related('assignees').attach(assigneeIds)
    }

    await task.load('categories', (q) => q.select(['id', 'name', 'color']))
    await task.load('assignees', (q) => q.select(['id', 'full_name', 'avatar_url']))
    await task.loadCount('comments')
    await task.loadCount('attachments')

    return serializeTask(task)
  }

  async update(
    id: number,
    data: {
      title?: string
      status?: TaskStatus
      category_ids?: number[]
      assignee_ids?: number[]
      // tolera camelCase por si acaso
      categoryIds?: number[]
      assigneeIds?: number[]
    }
  ) {
    const task = await Task.findOrFail(id)
    if (task.deleted_at) throw new Error('Cannot update a deleted task')

    if (data.title !== undefined) task.title = data.title
    if (data.status !== undefined) task.status = data.status
    await task.save()

    if (data.category_ids !== undefined || data.categoryIds !== undefined) {
      const ids = data.category_ids ?? data.categoryIds ?? []
      await task.related('categories').sync(ids)
    }
    if (data.assignee_ids !== undefined || data.assigneeIds !== undefined) {
      const ids = data.assignee_ids ?? data.assigneeIds ?? []
      await task.related('assignees').sync(ids)
    }

    await task.load('categories', (q) => q.select(['id', 'name', 'color']))
    await task.load('assignees', (q) => q.select(['id', 'full_name', 'avatar_url']))
    await task.loadCount('comments')
    await task.loadCount('attachments')

    return serializeTask(task)
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
