import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_attachments'
  
  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('task_id').unsigned().references('tasks.id').onDelete('CASCADE')
      table.string('file_name').notNullable()
      table.string('file_path').notNullable()
      table.integer('file_size').notNullable()
      table.integer('uploaded_by').unsigned().references('users.id')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }
  async down () { this.schema.dropTable(this.tableName) }
}
