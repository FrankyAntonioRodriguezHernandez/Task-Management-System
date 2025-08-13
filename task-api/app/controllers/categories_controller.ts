import type { HttpContext } from '@adonisjs/core/http'
import CategoriesService from '#services/categories_service'

const service = new CategoriesService()

export default class CategoriesController {
  public async index({ response }: HttpContext) {
    const cats = await service.list()
    return response.ok(cats)
  }
}
