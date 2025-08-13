import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Task from '#models/task'

export default class TaskCategory extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare color: string
  @column.dateTime({ autoCreate: true }) declare created_at: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updated_at: DateTime

  @manyToMany(() => Task, {
    pivotTable: 'task_category_pivot',
    pivotForeignKey: 'category_id',
    pivotRelatedForeignKey: 'task_id',
  })
  declare tasks: ManyToMany<typeof Task>
}
