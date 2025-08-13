import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_comments'
  
  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('task_id').unsigned().references('tasks.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id')
      table.text('comment').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }
  async down () { this.schema.dropTable(this.tableName) }
}
