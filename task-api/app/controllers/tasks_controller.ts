import type { HttpContext } from '@adonisjs/core/http'
import TaskService from '#services/task_service'
import { createTaskValidator, updateTaskValidator } from '#validators/task'

const service = new TaskService()

export default class TasksController {
  public async index({ request, response }: HttpContext) {
    const status = request.qs().status as any | undefined
    const tasks = await service.list({ status })
    return response.ok(tasks)
  }

  public async counts({ response }: HttpContext) {
    const data = await service.counts()
    return response.ok(data)
  }

  public async show({ params, response }: HttpContext) {
    const task = await service.getOne(Number(params.id))
    return response.ok(task)
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTaskValidator)
    const currentUserId = 1 // usuario fijo (sin auth)
    const created = await service.create(payload, currentUserId)
    return response.created(created)
  }

  public async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateTaskValidator)
    const updated = await service.update(Number(params.id), payload)
    return response.ok(updated)
  }

  public async destroy({ params, response }: HttpContext) {
    const out = await service.softDelete(Number(params.id))
    return response.ok(out)
  }

  public async deleted({ response }: HttpContext) {
    const rows = await service.listDeleted()
    return response.ok(rows)
  }

  public async restore({ params, response }: HttpContext) {
    const restored = await service.restore(Number(params.id))
    return response.ok(restored)
  }
}
