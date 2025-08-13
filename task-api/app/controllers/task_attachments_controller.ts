import type { HttpContext } from '@adonisjs/core/http'
import AttachmentService from '#services/attachment_service'
import { createAttachmentValidator } from '#validators/attachment'
import fs from 'node:fs'

const service = new AttachmentService()

export default class TaskAttachmentsController {
  public async index({ params, response }: HttpContext) {
    const list = await service.list(Number(params.id))
    return response.ok(list)
  }

  public async store({ params, request, response }: HttpContext) {
    await request.validateUsing(createAttachmentValidator)
    const file = request.file('file')
    if (!file) return response.badRequest({ message: 'Missing file field "file"' })

    const currentUserId = 1 // usuario fijo
    const att = await service.upload(Number(params.id), currentUserId, file)
    return response.created(att)
  }

  public async download({ params, response }: HttpContext) {
  const { fullPath, downloadName } = await service.downloadPath(Number(params.id))

  if (!fs.existsSync(fullPath)) {
    return response.notFound({ message: 'File not found' })
  }
  response.attachment(downloadName)
  return response.download(fullPath)
}

}
