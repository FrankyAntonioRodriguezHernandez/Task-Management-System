import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TaskCategory from '#models/task_category'
import TaskComment from '#models/task_comment'
import TaskAttachment from '#models/task_attachment'

export type TaskStatus = 'in_progress' | 'reviews' | 'completed' | 'done'

export default class Task extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare status: TaskStatus
  @column() declare created_by: number | null
  @column.dateTime() declare deleted_at: DateTime | null
  @column.dateTime({ autoCreate: true }) declare created_at: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updated_at: DateTime

  static notTrashed = scope((q) => q.whereNull('deleted_at'))
  static onlyTrashed = scope((q) => q.whereNotNull('deleted_at'))

  @belongsTo(() => User, { foreignKey: 'created_by' })
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => TaskCategory, {
    pivotTable: 'task_category_pivot',
    pivotForeignKey: 'task_id',
    pivotRelatedForeignKey: 'category_id',
  })
  declare categories: ManyToMany<typeof TaskCategory>

  @manyToMany(() => User, {
    pivotTable: 'task_assignees',
    pivotForeignKey: 'task_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare assignees: ManyToMany<typeof User>

  @hasMany(() => TaskComment, { foreignKey: 'task_id' })
  declare comments: HasMany<typeof TaskComment>

  @hasMany(() => TaskAttachment, { foreignKey: 'task_id' })
  declare attachments: HasMany<typeof TaskAttachment>
}
