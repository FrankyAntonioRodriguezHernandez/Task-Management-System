import Task from '#models/task'
import TaskComment from '#models/task_comment'

function assertInt(n: number, name: string) {
  if (!Number.isInteger(n)) throw new Error(`${name} must be an integer`)
}

export default class CommentService {
  async listByTask(taskId: number) {
    assertInt(taskId, 'taskId')
    const task = await Task.query().withScopes((s) => s.notTrashed()).where('id', taskId).firstOrFail()
    return task
      .related('comments')
      .query()
      .preload('user', (q) => q.select(['id', 'full_name', 'avatar_url']))
      .orderBy('id', 'asc')
  }

  async create(taskId: number, userId: number, comment: string) {
    await Task.query().withScopes((s) => s.notTrashed()).where('id', taskId).firstOrFail()
    const c = await TaskComment.create({ task_id: taskId, user_id: userId, comment })
    await c.refresh()
    return c
  }

  async update(taskId: number, commentId: number, newComment: string) {
    await Task.query().withScopes((s) => s.notTrashed()).where('id', taskId).firstOrFail()

    const row = await TaskComment.query()
      .where('id', commentId)
      .andWhere('task_id', taskId)
      .firstOrFail()

    row.comment = newComment
    await row.save()
    await row.refresh()
    return row
  }

  async destroy(taskId: number, commentId: number) {
    await Task.query().withScopes((s) => s.notTrashed()).where('id', taskId).firstOrFail()

    const row = await TaskComment.query()
      .where('id', commentId)
      .andWhere('task_id', taskId)
      .firstOrFail()

    await row.delete()
    return { success: true }
  }
}
