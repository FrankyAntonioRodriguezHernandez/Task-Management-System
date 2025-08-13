import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Task from '#models/task'
import User from '#models/user'

export default class TaskAttachment extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare task_id: number
  @column() declare file_name: string
  @column() declare file_path: string
  @column() declare file_size: number
  @column() declare uploaded_by: number
  @column.dateTime({ autoCreate: true }) declare created_at: DateTime

  @belongsTo(() => Task, { foreignKey: 'task_id' })
  declare task: BelongsTo<typeof Task>

  @belongsTo(() => User, { foreignKey: 'uploaded_by' })
  declare uploader: BelongsTo<typeof User>
}
