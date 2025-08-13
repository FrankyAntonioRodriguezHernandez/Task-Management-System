import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Task from '#models/task'
import TaskAttachment from '#models/task_attachment'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

const UPLOAD_DIR = app.makePath('uploads')

export default class AttachmentService {
  async list(taskId: number) {
    await Task.query().withScopes((s) => s.notTrashed()).where('id', taskId).firstOrFail()
    return TaskAttachment.query().where('task_id', taskId).orderBy('id', 'asc')
  }

  async upload(taskId: number, uploaderId: number, file: MultipartFile) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    const ext = file.extname || 'bin'
    const filename = `${randomUUID()}.${ext}`
    await file.move(UPLOAD_DIR, { name: filename, overwrite: false })

    return TaskAttachment.create({
      task_id: taskId,
      file_name: file.clientName || filename,
      file_path: filename, 
      file_size: file.size,
      uploaded_by: uploaderId,
    })
  }

  async downloadPath(attachmentId: number) {
    const att = await TaskAttachment.findOrFail(attachmentId)
    const fullPath = path.join(UPLOAD_DIR, path.basename(att.file_path)) // evita path traversal
    return { fullPath, downloadName: att.file_name }
  }
}
