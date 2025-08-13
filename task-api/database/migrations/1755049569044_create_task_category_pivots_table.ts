import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_category_pivot'
  
  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('task_id').unsigned().references('tasks.id').onDelete('CASCADE')
      table.integer('category_id').unsigned().references('task_categories.id')
      table.primary(['task_id','category_id'])
    })
  }

  async down () { 
    this.schema.dropTable(this.tableName) 
  }
}
