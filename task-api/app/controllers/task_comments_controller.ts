import type { HttpContext } from '@adonisjs/core/http'
import CommentService from '#services/comment_service'
import { createCommentValidator, updateCommentValidator } from '#validators/comment'

const service = new CommentService()

function parseTaskIdOr400(params: Record<string, any>, response: HttpContext['response']) {
  const taskId = Number(params.taskId ?? params.id) 
  if (!Number.isInteger(taskId)) {
    response.badRequest({ message: 'Invalid task id' })
    return null
  }
  return taskId
}

export default class TaskCommentsController {
  public async index({ params, response }: HttpContext) {
    const taskId = parseTaskIdOr400(params, response)
    if (taskId === null) return
    const rows = await service.listByTask(taskId)
    return response.ok(rows)
  }

  public async store({ params, request, response }: HttpContext) {
    const taskId = parseTaskIdOr400(params, response)
    if (taskId === null) return
    const payload = await request.validateUsing(createCommentValidator)
    const currentUserId = 1
    const created = await service.create(taskId, currentUserId, payload.comment)
    return response.created(created)
  }

  public async update({ params, request, response }: HttpContext) {
    const taskId = parseTaskIdOr400(params, response)
    if (taskId === null) return
    const commentId = Number(params.commentId)
    if (!Number.isInteger(commentId)) return response.badRequest({ message: 'Invalid comment id' })

    const payload = await request.validateUsing(updateCommentValidator)
    const updated = await service.update(taskId, commentId, payload.comment)
    return response.ok(updated)
  }

  public async destroy({ params, response }: HttpContext) {
    const taskId = parseTaskIdOr400(params, response)
    if (taskId === null) return
    const commentId = Number(params.commentId)
    if (!Number.isInteger(commentId)) return response.badRequest({ message: 'Invalid comment id' })

    const out = await service.destroy(taskId, commentId)
    return response.ok(out)
  }
}
