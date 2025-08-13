import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.enu('status', ['in_progress','reviews','completed','done'], { useNative: true, enumName: 'task_status' }).notNullable()
      table.integer('created_by').unsigned().references('users.id').onDelete('SET NULL')
      table.timestamp('deleted_at', { useTz: true }).nullable() 
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down () {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS task_status')
  }
}
