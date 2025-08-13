import type { HttpContext } from '@adonisjs/core/http'
import CommentService from '#services/comment_service'
import { createCommentValidator, updateCommentValidator } from '#validators/comment'

const service = new CommentService()

export default class TaskCommentsController {
  public async index({ params, response }: HttpContext) {
    const taskId = Number(params.id) 
    const rows = await service.listByTask(taskId)
    return response.ok(rows)
  }

  public async store({ params, request, response }: HttpContext) {
    const taskId = Number(params.id)
    const payload = await request.validateUsing(createCommentValidator)
    const currentUserId = 1 
    const created = await service.create(taskId, currentUserId, payload.comment)
    return response.created(created)
  }

  public async update({ params, request, response }: HttpContext) {
    const taskId = Number(params.id)
    const commentId = Number(params.commentId)
    const payload = await request.validateUsing(updateCommentValidator)
    const updated = await service.update(taskId, commentId, payload.comment)
    return response.ok(updated)
  }

  public async destroy({ params, response }: HttpContext) {
    const taskId = Number(params.id)
    const commentId = Number(params.commentId)
    const out = await service.destroy(taskId, commentId)
    return response.ok(out)
  }
}
