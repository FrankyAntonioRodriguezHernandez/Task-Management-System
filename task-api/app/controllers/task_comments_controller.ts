import type { HttpContext } from '@adonisjs/core/http'
import CommentService from '#services/comment_service'
import { createCommentValidator } from '#validators/comment'

const service = new CommentService()

export default class TaskCommentsController {
  public async index({ params, response }: HttpContext) {
    const list = await service.listByTask(Number(params.id))
    return response.ok(list)
  }

  public async store({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createCommentValidator)
    const currentUserId = 1 // usuario fijo
    const c = await service.create(Number(params.id), currentUserId, payload.comment)
    return response.created(c)
  }
}
