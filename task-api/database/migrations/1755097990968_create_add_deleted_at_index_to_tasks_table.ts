import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['deleted_at'], 'idx_tasks_deleted_at')
    })
  }

  async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['deleted_at'], 'idx_tasks_deleted_at')
    })
  }
}
