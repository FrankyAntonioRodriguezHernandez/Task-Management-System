import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path, { isAbsolute, join } from 'node:path'
import Task from '#models/task'
import TaskAttachment from '#models/task_attachment'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { unlink } from 'node:fs/promises'

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

  public async destroy(id: number) {
    const row = await TaskAttachment.findOrFail(id)

    const storedPath = row.file_path
    if (storedPath) {
      const candidates = [
        storedPath,
        path.isAbsolute(storedPath) ? undefined : path.join(process.cwd(), storedPath),
        path.isAbsolute(storedPath) ? undefined : app.tmpPath(storedPath),
      ].filter(Boolean) as string[]

      for (const p of candidates) {
        try {
          await unlink(p)   
          break
        } catch {
          // ignoramos y probamos el siguiente candidato
        }
      }
    }

    await row.delete()
    return { success: true }
  }

}
