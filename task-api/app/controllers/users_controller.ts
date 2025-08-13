import type { HttpContext } from '@adonisjs/core/http'
import UsersService from '#services/users_service'

const service = new UsersService()

export default class UsersController {
  public async index({ response }: HttpContext) {
    const users = await service.list()
    return response.ok(users)
  }
}
