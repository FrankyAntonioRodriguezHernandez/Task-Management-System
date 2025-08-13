import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_assignees'
  
  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('task_id').unsigned().references('tasks.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id')
      table.timestamp('assigned_at', { useTz: true }).defaultTo(this.now())
      table.primary(['task_id','user_id'])
    })
  }
  async down () { 
    this.schema.dropTable(this.tableName) 
  }
}
