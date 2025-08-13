import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Task from '#models/task'

export default class User extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare email: string
  @column() declare full_name: string
  @column() declare avatar_url?: string | null
  @column.dateTime({ autoCreate: true }) declare created_at: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updated_at: DateTime

  @hasMany(() => Task, { foreignKey: 'created_by' })
  declare createdTasks: HasMany<typeof Task>

  @manyToMany(() => Task, {
    pivotTable: 'task_assignees',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'task_id',
  })
  declare assignedTasks: ManyToMany<typeof Task>
}
